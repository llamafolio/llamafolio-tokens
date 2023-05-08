#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import url from 'node:url'

import { chains } from '../index'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

main()
  .then(() => {
    process.exit(0)
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

async function resizeImage(chain: string, filename: string) {
  try {
    const [address] = filename.split('.')
    const src = path.join(__dirname, '..', chain, 'logos', filename)
    const dest = path.join(
      __dirname,
      '..',
      chain,
      'logos-sm',
      address + '.webp'
    )

    await sharp(src)
      .resize({
        fit: 'fill',
        width: 64,
        height: 64
      })
      .webp({ lossless: true })
      .toFile(dest)
  } catch (error) {
    console.error(`Failed to resize ${chain}, ${filename}`, error)
  }
}

async function main() {
  for (const chain in chains) {
    const src = path.join(__dirname, '..', chain, 'logos')

    const logos: string[] = []

    fs.readdirSync(src).forEach(function (child) {
      logos.push(child)
    })

    await Promise.all(logos.map(logo => resizeImage(chain, logo)))
  }
}
