#!/usr/bin/env bun
import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs/promises'
import { chains, chainNames, Chain, Token } from '../index.js'

/**
 * For each chain tokens, generate a list of missing logos
 */

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

main().catch(_ => console.error(_))

async function main() {
  const chains = (process.argv[2] ? [process.argv[2]] : chainNames) as Array<Chain>
  for (const chain of chains) {
    const tokenListSrc = path.join(__dirname, '..', chain, 'tokenlist.json')
    const tokenList = (await Bun.file(tokenListSrc).json()) as Array<Token>

    const existingLogos = await fs.readdir(path.join(__dirname, '..', chain, 'logos'))
    const existingLogosSM = await fs.readdir(path.join(__dirname, '..', chain, 'logos-sm'))

    // logo
    const missingLogos = tokenList.filter(({ address }) => !existingLogos.includes(`${address}.png`))
    const missingLogosSM = existingLogos.filter(_ => !existingLogosSM.includes(_))
    console.log({
      [chain]: {
        missingLogos: missingLogos.length,
        missingLogosSM: missingLogosSM.length,
        desiredTotal: `${tokenList.length} logos x2 (logos & logos-sm)`,
      }
    })
  }
}
