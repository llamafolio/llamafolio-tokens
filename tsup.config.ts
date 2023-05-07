import { defineConfig } from 'tsup'

export default defineConfig({
  dts: true,
  shims: true,
  clean: true,
  bundle: true,
  keepNames: true,
  target: 'esnext',
  outDir: './build',
  platform: 'neutral',
  format: ['esm'],
  entryPoints: ['./index.ts'],
  minify: process.env.NODE_ENV === 'production',
  onSuccess: async () => {
    console.log(`
      -🦙                 🦙-----------
      --🦙                 🦙----------
      ---🦙                 🦙---------
      ----🦙                 🦙--------
      -----🦙                 🦙-------
      ------🦙 Build completed 🦙------
      -------🦙                 🦙-----
      --------🦙                 🦙----
      ---------🦙                 🦙---
      ----------🦙                 🦙--
      -----------🦙                 🦙-\n`)
    /**
     *
     * In case bundling is not desired and having a directory per chain is preferred,
     * uncomment the 2 lines of code below.
     */

    // const fs = await import('node:fs/promises')
    // const chains = ["ethereum", "polygon", "harmony", "arbitrum", "optimism", "bsc", "fantom", "celo", "avax", "xdai", "avalanche", "gnosis"]
    // chains.map(chain => fs.cp(chain, `./build/${chain}`, { recursive: true }))
  }
})
