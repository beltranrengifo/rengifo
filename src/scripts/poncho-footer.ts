import { Companion } from '../board/companion';

/**
 * Poncho in the classic footer: the same cat as on the board, sitting by
 * the door to it. He follows the pointer with his eyes, hops with a "miau"
 * when the pointer comes to him, and falls asleep if left alone. Animated
 * only while the footer is on screen.
 */

const svg = document.querySelector<SVGSVGElement>('[data-poncho-footer]');
if (svg) {
  const stage = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.append(stage);
  const cat = new Companion(stage, 0, 0, 'Poncho');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Where the pointer is, in the cat's own coordinates.
  window.addEventListener('pointermove', (event) => {
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    cat.lookAt({ x: point.x, y: point.y });
  });
  svg
    .closest('a')
    ?.addEventListener('pointerenter', () => cat.poke(performance.now(), true));

  let visible = false;
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    cat.update(now, dt, 0);
    if (visible && !still) requestAnimationFrame(frame);
  };
  cat.update(performance.now(), 0, 0);
  new IntersectionObserver(([entry]) => {
    const was = visible;
    visible = entry?.isIntersecting ?? false;
    if (visible && !was && !still) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }).observe(svg);
}
