#!/usr/bin/env bun
import type { Chain, Token } from '../index.js'
import { chainNamesArray } from './constants.js'

type ListItem = { id: string; symbol: string; name: string }

main().catch(_ => console.error(_))

async function main() {
  const chain = process.argv[2] as Chain | 'all'
  console.log(chain)
  await updateChainsTokenLists('arbitrum')
}

async function updateChainsTokenLists(chain: Chain | 'all') {
  const coingeckoListResponse = await fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false')
  const coingeckoList = (await coingeckoListResponse.json()) as Array<ListItem>

  if (chain !== 'all') {
    const chainTokens = await getUpdatedTokenList(chain, coingeckoList)
    Bun.write(`./${chain}/tokenlist.json`, JSON.stringify(chainTokens, null, 2) + '\n')
    return
  }

  for (const chainName of chainNamesArray) {
    const chainTokens = await getUpdatedTokenList(chainName, coingeckoList)
    Bun.write(`./${chain}/tokenlist.json`, JSON.stringify(chainTokens, null, 2) + '\n')
  }
}

async function getUpdatedTokenList(chain: Chain, coingeckoList: Array<ListItem>) {
  const { default: chainTokens } = (await import(`../${chain}/tokenlist.json`)) as { default: Array<Token> }

  const writableTokens = [] as Array<Token>

  for (const token of chainTokens) {
    if (token.coingeckoId && token.coingeckoId.length > 0) {
      writableTokens.push({ ...token, address: token.address.toLowerCase() })
      continue
    }
    const coingeckoItem = coingeckoList.find(
      item =>
        item.symbol.toLowerCase() === token.symbol.toLowerCase() && //
        item.name.toLowerCase() === token.name.toLowerCase()
    )
    if (!coingeckoItem) {
      writableTokens.push({ ...token, address: token.address.toLowerCase() })
      continue
    }

    writableTokens.push({ ...token, coingeckoId: coingeckoItem.id, address: token.address.toLowerCase() })
  }
  return writableTokens
}
