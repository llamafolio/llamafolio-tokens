#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

import { chains } from '../index'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

main().catch(_ => console.error(_))

async function getCoingeckoMarkets(page: number, pageSize: number) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${pageSize}&page=${page}&sparkline=false&locale=en`
  )
  const markets = (await res.json()) as any

  const ids = new Set<string>()

  for (const market of markets) {
    ids.add(market.id)
  }

  return Array.from(ids)
}

async function main() {
  // argv[0]: ts-node
  // argv[1]: coingecko-top.ts
  // argv[2]: page
  // argv[3]: pageSize

  const page = parseInt(process.argv[2]) || 1
  const pageSize = parseInt(process.argv[3]) || 100

  const coingeckoIds = await getCoingeckoMarkets(page, pageSize)

  const storedCoingeckoIds = new Set<string>()

  for (const chain in chains) {
    const tokenListSrc = path.join(__dirname, '..', chain, 'tokenlist.json')
    const tokenListBuffer = fs.readFileSync(tokenListSrc, 'utf8')
    const tokenList = JSON.parse(tokenListBuffer) as any[]

    for (const token of tokenList) {
      if (token.coingeckoId) {
        storedCoingeckoIds.add(token.coingeckoId)
      }
    }
  }

  console.log(
    'Missing tokens from Coingecko top markets',
    coingeckoIds.filter(id => !storedCoingeckoIds.has(id)).join(',')
  )
}
