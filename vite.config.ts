/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The lazy-loaded three.js chunk is ~870 kB by nature; the initial bundle stays small.
  build: { chunkSizeWarningLimit: 1000 },
  test: {
    environment: 'node',
    passWithNoTests: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/engine/run-match.ts'],
      thresholds: { branches: 100 },
    },
  },
});
