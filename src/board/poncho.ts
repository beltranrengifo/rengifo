/**
 * Poncho, the cat, as a wink rather than a mascot: he answers some of what
 * the visitor does, never all of it, and never the same way twice in a row.
 * Each reaction has its own cooldown and a chance of being ignored.
 */

export type PonchoEvent = 'fling' | 'drip' | 'open' | 'interact';
type Mood = 'idle' | 'stretch' | 'sleep';

const STRETCH_MS = 1700;
const SLEEP_AFTER_MS = 30_000;

const REACTIONS: Record<
  Exclude<PonchoEvent, 'interact'>,
  { cooldown: number; chance: number }
> = {
  fling: { cooldown: 12_000, chance: 0.7 },
  drip: { cooldown: 20_000, chance: 0.4 },
  open: { cooldown: 35_000, chance: 0.35 },
};

export class Poncho {
  private mood: Mood = 'idle';
  private moodUntil = 0;
  private lastTouch: number | null = null;
  private lastReaction: Record<string, number> = {};

  constructor(
    private readonly el: HTMLElement,
    private readonly random: () => number = Math.random,
  ) {
    this.set('idle');
  }

  notify(event: PonchoEvent, now: number): void {
    const wasAsleep = this.mood === 'sleep';
    this.lastTouch = now;
    if (event === 'interact') {
      // Waking up is the one thing he always does.
      if (wasAsleep) this.stretch(now);
      return;
    }
    if (wasAsleep) {
      this.stretch(now);
      return;
    }
    const { cooldown, chance } = REACTIONS[event];
    const last = this.lastReaction[event] ?? -Infinity;
    if (now - last < cooldown || this.random() > chance) return;
    this.lastReaction[event] = now;
    this.stretch(now);
  }

  tick(now: number): void {
    this.lastTouch ??= now;
    if (this.mood === 'stretch' && now > this.moodUntil) this.set('idle');
    if (this.mood === 'idle' && now - this.lastTouch > SLEEP_AFTER_MS) {
      this.set('sleep');
    }
  }

  private stretch(now: number): void {
    this.moodUntil = now + STRETCH_MS;
    this.set('stretch');
  }

  private set(mood: Mood): void {
    this.mood = mood;
    this.el.dataset.mood = mood;
  }
}
