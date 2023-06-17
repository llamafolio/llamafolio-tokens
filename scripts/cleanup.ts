#!/usr/bin/env bun
import path from 'node:path'
import url from 'node:url'

import { chains, type Token } from '../index.js'
import { updateTokenList } from './update-token-list.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

main().catch(_ => console.error(_))

async function main() {
  for (const chain in chains) {
    const tokenListSrc = path.join(__dirname, '..', chain, 'tokenlist.json')
    const tokenList = (await Bun.file(tokenListSrc).json()) as Array<Token>

    const tokenByAddress: { [key: string]: Token } = {}

    for (const token of tokenList) {
      const found = tokenByAddress[token.address]

      tokenByAddress[token.address] = {
        address: token.address.toLowerCase(),
        name: found?.name || token.name,
        symbol: found?.symbol || token.symbol,
        decimals: found?.decimals || token.decimals,
        coingeckoId: found?.coingeckoId || token.coingeckoId,
        native: found?.native || token.native,
        wallet: found?.wallet || token.wallet,
        stable: found?.stable || token.stable
      }

      const logo = Bun.file(`${chain}/logos/${token.address}.png`)
      if(logo.size < 1){
        console.log(`logo ${token.address} not found`)
      }
    }

    const newTokenList = Object.values(tokenByAddress)

    updateTokenList(chain, newTokenList)

    console.log(`Successfully updated ${chain}`)
  }
}
