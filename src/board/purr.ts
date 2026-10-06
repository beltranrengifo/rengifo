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
