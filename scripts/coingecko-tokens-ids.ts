import fs from 'node:fs'
import type { Chain, Token } from '../index.js'

type ListItem = { id: string; symbol: string; name: string }

main().catch(_ => console.error(_))

async function main(chain: Chain = 'optimism') {
  const coingeckoListResponse = await fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false')
  const coingeckoList = (await coingeckoListResponse.json()) as Array<ListItem>

  const { default: chainTokens } = (await import(`../${chain}/tokenlist.json`)) as { default: Array<Token> }

  const withCoingeckoId = []

  for (const token of chainTokens) {
    if (token.coingeckoId && token.coingeckoId.length > 0) {
      withCoingeckoId.push(token)
      continue
    }
    const coingeckoItem = coingeckoList.find(item => item.symbol === token.symbol)
    if (!coingeckoItem) continue

    withCoingeckoId.push({ ...token, coingeckoId: coingeckoItem.id })
  }
  return withCoingeckoId
}
