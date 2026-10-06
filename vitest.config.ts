/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Astro's Vite config, so tests can import data that imports images.
export default getViteConfig({ test: {} });
