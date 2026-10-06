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
  window.addEventListener(type, () => (unlocked = true), { once: true });
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
    const length = Math.floor(ctx.sampleRate * 0.06);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      // Noise that dies away fast: a tap, not a hiss.
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    // Low and soft: a padded paw on the floor, not a click.
    filter.type = 'lowpass';
    filter.frequency.value = 180 + Math.random() * 60;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.22 + Math.random() * 0.06;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    /* no audio, no steps */
  }
}

/** A loud, plaintive meow: a voiced glide up and down, through a mouth. */
export function meow(): void {
  if (!unlocked) return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    const pitch = 0.9 + Math.random() * 0.2;
    const voice = ctx.createOscillator();
    voice.type = 'sawtooth';
    voice.frequency.setValueAtTime(420 * pitch, t);
    voice.frequency.exponentialRampToValueAtTime(720 * pitch, t + 0.18);
    voice.frequency.exponentialRampToValueAtTime(380 * pitch, t + 0.7);
    // The mouth opens ("mi-") then closes ("-au").
    const mouth = ctx.createBiquadFilter();
    mouth.type = 'bandpass';
    mouth.Q.value = 3;
    mouth.frequency.setValueAtTime(900, t);
    mouth.frequency.linearRampToValueAtTime(1800, t + 0.2);
    mouth.frequency.linearRampToValueAtTime(700, t + 0.7);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.05);
    gain.gain.setValueAtTime(0.5, t + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    voice.connect(mouth).connect(gain).connect(ctx.destination);
    voice.start(t);
    voice.stop(t + 0.8);
  } catch {
    /* no audio, no meow */
  }
}
