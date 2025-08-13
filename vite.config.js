import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [dts({ rollupTypes: true, rollupOptions: { external: ['solid-js', 'solid-js/web'] } })],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'), 
            fileName: "index",
            formats: ['esm'],
            
        },
        minify: true,
        rollupOptions: {
            external: ['solid-js', 'solid-js/web'],
            
        },
    },
});