import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  envDir: '..',
  base: './',
  build: { target: 'es2022', outDir: '../dist', emptyOutDir: true },
  test: { root: fileURLToPath(new URL('.', import.meta.url)), include: ['tests/**/*.test.ts'] },
});
