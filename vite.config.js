import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
    plugins: [
        solidPlugin(),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'tests/benchmark.tsx'), 
            fileName: "test",
            formats: ['esm'],
        },
    },
});