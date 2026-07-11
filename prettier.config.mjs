/** @type {import("prettier").Config} */
export default {
  printWidth: 80,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  // prettier-plugin-tailwindcss must be listed LAST so it can sort classes.
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
  ],
};
