import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  sourcemap: true,
  outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
//   minify: true,
})