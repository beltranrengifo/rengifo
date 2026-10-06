/**
 * Embeddings for the board's search. Reads the built English board page,
 * takes the text of every node's panel, and turns each into a vector with a
 * small sentence model (all-MiniLM-L6-v2) — the same one the browser loads
 * when someone searches. The vectors are stored as int8, base64, so the
 * whole set weighs a few dozen kilobytes.
 *
 *   npm run embed   (builds first, then writes src/data/board-embeddings.json)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { pipeline } from '@huggingface/transformers';

export const MODEL = 'Xenova/all-MiniLM-L6-v2';

const html = await readFile(
  new URL('../../dist/board/index.html', import.meta.url),
  'utf8',
);

const decode = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const texts = new Map();
for (const [, id, body] of html.matchAll(
  /<section data-panel="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g,
)) {
  const text = decode(
    body
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  texts.set(id, text.slice(0, 1200));
}
if (texts.size === 0)
  throw new Error('No panels found — run `npm run build` first.');

const embed = await pipeline('feature-extraction', MODEL, { dtype: 'q8' });
const vectors = {};
for (const [id, text] of texts) {
  const output = await embed(text, { pooling: 'mean', normalize: true });
  const values = Array.from(output.data);
  const bytes = Int8Array.from(values, (v) =>
    Math.max(-127, Math.min(127, Math.round(v * 127))),
  );
  vectors[id] = Buffer.from(bytes.buffer).toString('base64');
}

await writeFile(
  new URL('../../src/data/board-embeddings.json', import.meta.url),
  JSON.stringify({ model: MODEL, dims: 384, vectors }, null, 0) + '\n',
);
console.log(`Embedded ${texts.size} nodes.`);
