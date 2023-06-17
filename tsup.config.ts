import { defineConfig } from 'tsup'

export default defineConfig({
  dts: true,
  shims: true,
  clean: true,
  bundle: true,
  keepNames: true,
  treeshake: true,
  target: 'esnext',
  outDir: './build',
  platform: 'neutral',
  format: ['esm'],
  entryPoints: ['./index.ts'],
  minify: process.env.NODE_ENV === 'production'
})
