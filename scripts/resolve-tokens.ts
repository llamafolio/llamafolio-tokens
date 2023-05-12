#!/usr/bin/env node
import { chains } from '../index'
import type { Chain } from '../index'
import { updateTokenList } from './update-token-list'

main().catch(_ => console.error(_))

export const coingeckoPlatformToChain = {
  avalanche: 'avalanche',
  'binance-smart-chain': 'bsc',
  celo: 'celo',
  ethereum: 'ethereum',
  fantom: 'fantom',
  'harmony-shard-0': 'harmony',
  moonbeam: 'moonbeam',
  'polygon-pos': 'polygon',
  xdai: 'gnosis',
  'optimistic-ethereum': 'optimism',
  'arbitrum-one': 'arbitrum'
} satisfies { [key: string]: string }

async function getCoingeckoIds(chainTokens: Partial<Record<string, Record<string, any>>>) {
  const res = await fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=true')
  const coins = (await res.json()) as Array<any>

  for (const coin of coins) {
    if (coin.platforms) {
      for (const coingecko_chain in coin.platforms) {
        const chain = coingeckoPlatformToChain[coingecko_chain as keyof typeof coingeckoPlatformToChain]
        if (!chain) {
          console.log(`Chain ${coingecko_chain} not supported yet`)
          continue
        }

        const token = chainTokens[chain]?.[coin.platforms[coingecko_chain].toLowerCase()]
        if (token) {
          if (!token.name) {
            token.name = coin.name
          }
          if (!token.coingeckoId) {
            token.coingeckoId = coin.id
          }
        }
      }
    }
  }

  return chainTokens
}

async function main() {
  const chainsTokens: Partial<Record<string, Record<string, any>>> = {}

  for (const chain in chains) {
    chainsTokens[chain] = {}

    for (const token of chains[chain as Chain]) {
      chainsTokens[chain]![token.address] = token
    }
  }

  await getCoingeckoIds(chainsTokens)

  for (const chain in chains) {
    const tokens = Object.values(chainsTokens[chain]!)

    updateTokenList(chain, tokens)
  }
}
