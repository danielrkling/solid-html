import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Change this to jsdom to support document/TreeWalker
    environment: 'jsdom', 
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
      ]
    },
    benchmark: {
      include: ['tests/**/*.bench.ts', 'bench/**/*.bench.ts'],
      outputFile: './benchmarks-results.json',
    }
  }
});