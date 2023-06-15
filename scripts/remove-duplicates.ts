#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

import { chains } from '../index'
import type { Token } from '../index'
import { updateTokenList } from './update-token-list'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

main().catch(_ => console.error(_))

async function main() {
  for (const chain in chains) {
    const tokenListSrc = path.join(__dirname, '..', chain, 'tokenlist.json')
    const tokenListBuffer = fs.readFileSync(tokenListSrc, 'utf8')
    const tokenList = JSON.parse(tokenListBuffer) as Token[]

    const tokenByAddress: { [key: string]: Token } = {}

    for (const token of tokenList) {
      const found = tokenByAddress[token.address]

      tokenByAddress[token.address] = {
        address: token.address,
        name: found?.name || token.name,
        symbol: found?.symbol || token.symbol,
        decimals: found?.decimals || token.decimals,
        coingeckoId: found?.coingeckoId || token.coingeckoId,
        native: found?.native || token.native,
        wallet: found?.wallet || token.wallet,
        stable: found?.stable || token.stable
      }
    }

    const newTokenList = Object.values(tokenByAddress)

    updateTokenList(chain, newTokenList)

    console.log(`Successfully updated ${chain}`)
  }
}
