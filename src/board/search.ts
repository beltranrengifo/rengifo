/**
 * Search on the board, in two steps. Words first: every node's panel text,
 * matched as you type, accents and case aside. Meaning second: on the first
 * search, a small sentence model (all-MiniLM-L6-v2, about 23 MB) loads in
 * the browser — no server, no key — and ranks the nodes by how close their
 * text is to the query, using vectors made ahead of time by
 * scripts/embed/generate.mjs. If the model cannot load, words still work.
 */
import data from '../data/board-embeddings.json';

export interface SearchItem {
  id: string;
  label: string;
  /** The node's panel text, in the page's language. */
  text: string;
}

export interface Hit {
  id: string;
  label: string;
}

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/** Stored vectors are int8 in base64; back to unit-length floats. */
const vectors = new Map<string, Float32Array>(
  Object.entries(data.vectors as Record<string, string>).map(([id, b64]) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const ints = new Int8Array(bytes.buffer);
    return [id, Float32Array.from(ints, (v) => v / 127)];
  }),
);

type Embed = (text: string) => Promise<Float32Array>;
let model: Promise<Embed | null> | null = null;

/** Load the model once, on demand. Resolves null if it cannot load. */
export function loadModel(): Promise<Embed | null> {
  model ??= import('@huggingface/transformers')
    .then(async ({ pipeline }) => {
      const extract = await pipeline('feature-extraction', data.model, {
        dtype: 'q8',
      });
      return async (text: string) => {
        const output = await extract(text, {
          pooling: 'mean',
          normalize: true,
        });
        return output.data as Float32Array;
      };
    })
    .catch((error: unknown) => {
      console.warn('[board search] model unavailable; words only', error);
      return null;
    });
  return model;
}

/** Instant: nodes whose label or text contain every word of the query. */
export function byWords(items: SearchItem[], query: string): Hit[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return items
    .map((item) => {
      const label = fold(item.label);
      const text = fold(item.text);
      if (!words.every((w) => label.includes(w) || text.includes(w))) {
        return null;
      }
      const score = words.reduce(
        (s, w) => s + (label.includes(w) ? 3 : 0) + (text.includes(w) ? 1 : 0),
        0,
      );
      return { item, score };
    })
    .filter((hit) => hit !== null)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => ({ id: item.id, label: item.label }));
}

/** By meaning: nodes ranked by cosine similarity to the query. */
export async function byMeaning(
  items: SearchItem[],
  query: string,
  limit = 8,
): Promise<Hit[] | null> {
  const embed = await loadModel();
  if (!embed) return null;
  const q = await embed(query);
  return items
    .map((item) => {
      const v = vectors.get(item.id);
      if (!v) return { item, score: -1 };
      let dot = 0;
      for (let i = 0; i < v.length; i++) dot += v[i]! * q[i]!;
      return { item, score: dot };
    })
    .filter(({ score }) => score > 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => ({ id: item.id, label: item.label }));
}
