/**
 * A purr, synthesised: low filtered noise pulsed about 25 times a second,
 * like a cat breathing in and out. Very quiet, and only once the browser
 * allows sound — after the visitor has clicked or tapped something — so a
 * hover never starts audio on its own.
 */

let context: AudioContext | null = null;
let unlocked = false;

// The first real gesture on the page unlocks audio for the purr.
for (const type of ['pointerdown', 'keydown'] as const) {
  window.addEventListener(type, () => (unlocked = true), {
    once: true,
    capture: true,
  });
}

export class Purr {
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private lfo: OscillatorNode | null = null;

  start(): void {
    if (!unlocked || this.source) return;
    try {
      context ??= new AudioContext();
      void context.resume();
      const ctx = context;

      const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = noise;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      filter.Q.value = 0.8;

      // The pulse: a gain that rises and falls at purring rate.
      const pulse = ctx.createGain();
      pulse.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 25;
      const depth = ctx.createGain();
      depth.gain.value = 0.5;
      lfo.connect(depth).connect(pulse.gain);

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.4);

      source
        .connect(filter)
        .connect(pulse)
        .connect(gain)
        .connect(ctx.destination);
      source.start();
      lfo.start();
      this.source = source;
      this.lfo = lfo;
      this.gain = gain;
    } catch {
      /* no audio, no purr */
    }
  }

  stop(): void {
    if (!context || !this.source || !this.gain) return;
    const { source, lfo, gain } = this;
    const end = context.currentTime + 0.35;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, context.currentTime);
    gain.gain.linearRampToValueAtTime(0, end);
    source.stop(end);
    lfo?.stop(end);
    this.source = null;
    this.lfo = null;
    this.gain = null;
  }
}

/**
 * A paw on the floor: a very short, soft tap of filtered noise, slightly
 * different each time. Same rule as the purr — only once audio is unlocked.
 */
export function pawStep(): void {
  if (!unlocked) return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    if (ctx.state === 'suspended') void ctx.resume();
    const length = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      // Noise that dies away fast: a tap, not a hiss.
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 6);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    // Mid-low and short: a soft pat, neither a click nor a rumble.
    filter.type = 'bandpass';
    filter.frequency.value = 480 + Math.random() * 160;
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.value = 0.16 + Math.random() * 0.04;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    /* no audio, no steps */
  }
}

/**
 * A short meow, "m-ya-u": a buzzy voice shaped by the formants of a mouth
 * that opens from a hum and closes again, with the pitch rising and falling.
 */
export function meow(): void {
  if (!unlocked) return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    const end = t + 0.6;
    const pitch = 0.95 + Math.random() * 0.1;
    const voice = ctx.createOscillator();
    voice.type = 'sawtooth';
    voice.frequency.setValueAtTime(380 * pitch, t);
    voice.frequency.linearRampToValueAtTime(540 * pitch, t + 0.2);
    voice.frequency.linearRampToValueAtTime(330 * pitch, end);

    // Formants in parallel: the vowel moves from "i" through "a" to "u".
    const mix = ctx.createGain();
    const formant = (
      points: [number, number][],
      q: number,
      level: number,
    ): void => {
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = q;
      band.frequency.setValueAtTime(points[0]![1], t);
      for (const [at, hz] of points.slice(1)) {
        band.frequency.linearRampToValueAtTime(hz, t + at);
      }
      const amount = ctx.createGain();
      amount.gain.value = level;
      voice.connect(band).connect(amount).connect(mix);
    };
    formant(
      [
        [0, 500],
        [0.2, 1000],
        [0.6, 550],
      ],
      6,
      1,
    );
    formant(
      [
        [0, 2000],
        [0.2, 1600],
        [0.6, 900],
      ],
      8,
      0.6,
    );
    formant([[0, 2800]], 10, 0.25);

    // The mouth: closed (a hum) at the start, open, then closing.
    const mouth = ctx.createBiquadFilter();
    mouth.type = 'lowpass';
    mouth.frequency.setValueAtTime(400, t);
    mouth.frequency.exponentialRampToValueAtTime(3200, t + 0.1);
    mouth.frequency.exponentialRampToValueAtTime(800, end);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.06);
    gain.gain.setValueAtTime(0.35, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    mix.connect(mouth).connect(gain).connect(ctx.destination);
    voice.start(t);
    voice.stop(end + 0.05);
  } catch {
    /* no audio, no meow */
  }
}
