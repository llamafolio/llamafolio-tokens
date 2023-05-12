#!/usr/bin/env node
import { chains } from '../index'
import type { Chain } from '../index'
import { updateTokenList } from './update-token-list'

main().catch(_ => console.error(_))

async function main() {
  const stablecoinsRes = await fetch('https://stablecoins.llama.fi/stablecoins')
  const stablecoins = (await stablecoinsRes.json()) as {
    peggedAssets: { gecko_id: string }[]
  }

  const peggedAssets = stablecoins.peggedAssets
  const peggedAssetsGeckoIds = new Set(peggedAssets.map(asset => asset.gecko_id))

  for (const chain in chains) {
    const newTokenList = chains[chain as Chain].map(token => {
      // if the token is known as stable, mark it.
      // if not, leave it undefined
      if (token.coingeckoId && peggedAssetsGeckoIds.has(token.coingeckoId)) {
        token.stable = true
      }
      return token
    })

    updateTokenList(chain, newTokenList)
  }
}
