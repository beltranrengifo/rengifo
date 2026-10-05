import type { BoardModel, Track } from './model';

/**
 * How loud each technology is at each moment, shaped like a sound: it swells
 * in when a job starts using it (attack), holds while the job lasts
 * (sustain), and fades slowly once it ends (release) — down to a floor,
 * because what you have learnt does not go fully silent.
 *
 * Paid work and side projects add up differently: the loudest job sets the
 * level, and everything else running at the same time only adds a little.
 */

const ATTACK = 0.35; // years to reach full level
const HALF_LIFE = 1.6; // years for the release to halve
const FLOOR = 0.12; // share of the level that never fades
const PROJECT_GAIN = 0.55; // side projects are quieter than jobs
const OVERLAP = 0.3; // how much the non-loudest uses add

/** Level of one use at time t, before weighting. */
export function envelope(t: number, start: number, end: number): number {
  if (t < start - ATTACK) return 0;
  if (t < start) {
    const x = (t - (start - ATTACK)) / ATTACK;
    return x * x * (3 - 2 * x); // smoothstep
  }
  if (t <= end) return 1;
  const decay = Math.pow(0.5, (t - end) / HALF_LIFE);
  return FLOOR + (1 - FLOOR) * decay;
}

/** A track's level at time t, in weight units (roughly 0–3.5). */
export function level(model: BoardModel, track: Track, t: number): number {
  let loudest = 0;
  let rest = 0;
  for (const use of track.uses) {
    const clip = model.clips[use.clip]!;
    const gain = clip.kind === 'project' ? PROJECT_GAIN : 1;
    const value = use.weight * gain * envelope(t, clip.start, clip.end);
    if (value > loudest) {
      rest += loudest;
      loudest = value;
    } else {
      rest += value;
    }
  }
  return loudest + rest * OVERLAP;
}

/** Sample every track across [from, to] at a fixed step. */
export function sample(
  model: BoardModel,
  from: number,
  to: number,
  steps: number,
): Float32Array[] {
  return model.tracks.map((track) => {
    const out = new Float32Array(steps + 1);
    for (let i = 0; i <= steps; i++) {
      out[i] = level(model, track, from + ((to - from) * i) / steps);
    }
    return out;
  });
}

/** First and last years a track is audible above a whisper. */
export function audibleSpan(model: BoardModel, track: Track): [number, number] {
  const starts = track.uses.map((use) => model.clips[use.clip]!.start);
  const ends = track.uses.map((use) => model.clips[use.clip]!.end);
  return [Math.min(...starts), Math.max(...ends)];
}
