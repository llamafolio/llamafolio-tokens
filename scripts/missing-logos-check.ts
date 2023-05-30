#!/usr/bin/env node
/**
 * Identify tokens that don't have a logo.
 * Logos for each chains are stored in `{chain}/logos` and `{chain}/logos-sm`.
 * Logos in `logos` are `.png` and `logos-sm` are `.webp`.
 * If logos are in `/logos` but not in `/logos-sm`,
 * that means `./scripts/resize-logos.ts` is not working properly
 */
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { chains } from '../index'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

run()

function run() {
  try {
    const allMissingLogos: Record<string, string[]> = {}
    for (const chain in chains) {
      const logos = fs.readdirSync(path.join(__dirname, '..', chain, 'logos')).map(logo => logo.split('.')[0])
      const logosSm = fs.readdirSync(path.join(__dirname, '..', chain, 'logos-sm')).map(logo => logo.split('.')[0])
      const missingLogos = logos.filter(logo => !logosSm.includes(logo))
      if (missingLogos.length > 0) {
        allMissingLogos[chain] = missingLogos
      }
    }
    if (Object.keys(allMissingLogos).length > 0) {
      console.log(JSON.stringify(allMissingLogos, undefined, 2))
      console.info(`\nThe above logos are missing the logos-sm version && The .png ones are also likely corrupt.\n`)
      process.exit(1)
    }
    process.exit(0)
  } catch (error) {
    console.error('error running ./scripts/missing-logos-check.ts#run()', error)
    process.exit(1)
  } finally {
    console.log('Done')
  }
}
