#!/usr/bin/env node
import fs from 'node:fs'
import buffer from 'node:buffer'
import path from 'node:path'
import url from 'node:url'

import { updateTokenList } from './update-token-list'
import { sleep } from './utilities'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

main().catch(_ => console.error(_))

async function downloadLogo(url: string) {
  const response = await fetch(url)
  // download the image file
  const arrayBuffer = await response.arrayBuffer()
  return buffer.Buffer.from(arrayBuffer)
}

export const coingeckoPlatformToChain = {
  'arbitrum-one': 'arbitrum',
  'arbitrum-nova': 'arbitrum-nova',
  avalanche: 'avalanche',
  base: 'base',
  'binance-smart-chain': 'bsc',
  celo: 'celo',
  ethereum: 'ethereum',
  fantom: 'fantom',
  'harmony-shard-0': 'harmony',
  linea: 'linea',
  moonbeam: 'moonbeam',
  opbnb: 'opbnb',
  'polygon-pos': 'polygon',
  'polygon-zkevm': 'polygon-zkevm',
  'optimistic-ethereum': 'optimism',
  xdai: 'gnosis',
  zksync: 'zksync-era'
}

async function getCoingeckoTokens(id: string) {
  let retries = 0

  while (retries < 3) {
    retries++

    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`)

    // rate limit, retry
    if (res.status === 429) {
      console.log(`Rate limit: ${id}, retries: ${retries}...`)
      await sleep(60_000)
    } else {
      if (!res.ok) {
        console.error(`Error [${res.status}]: ${res.statusText}`)
        return {}
      }

      const json = (await res.json()) as any

      const tokensByChain = {} as Record<string, any>

      for (const coingecko_chain in json.detail_platforms) {
        const chain = coingeckoPlatformToChain[coingecko_chain as keyof typeof coingeckoPlatformToChain]
        if (!chain) {
          console.log(`Chain ${coingecko_chain} not supported yet`)
          continue
        }

        tokensByChain[chain] = {
          logoUrl: json.image.large,
          address: json.detail_platforms[coingecko_chain].contract_address.toLowerCase(),
          name: json.name,
          symbol: json.symbol.toUpperCase(),
          decimals: json.detail_platforms[coingecko_chain].decimal_place,
          coingeckoId: id
        }
      }

      return tokensByChain
    }
  }

  console.error(`Failed to get coin: ${id}`)

  return {}
}

function help() {}

async function main() {
  // argv[0]: ts-node
  // argv[1]: add-token.ts
  // argv[2]: source = coingecko
  // argv[3]: sourceId = coingecko id comma separated list of tokens
  if (process.argv.length < 3) {
    console.error('Missing source')
    return help()
  }
  if (process.argv.length < 4) {
    console.error('Missing source id')
    return help()
  }

  const source = process.argv[2]
  const sourceId = process.argv[3]

  const ids = sourceId?.split(',') ?? []

  for (const id of ids) {
    let tokensByChain = {} as any

    switch (source) {
      case 'coingecko':
        tokensByChain = await getCoingeckoTokens(id)
        break

      case 'defillama':
        break

      default:
        console.error(`Source ${source} not supported.`)
        return help()
    }

    for (const chain in tokensByChain) {
      const token = tokensByChain[chain as keyof typeof tokensByChain] as any

      const tokenListSrc = path.join(__dirname, '..', chain, 'tokenlist.json')
      const tokenListBuffer = fs.readFileSync(tokenListSrc, 'utf8')
      const tokenList = JSON.parse(tokenListBuffer) as any[]

      const prevAddresses = new Set(tokenList.map(token => token.address))

      if (!prevAddresses.has(token.address)) {
        tokenList.push({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          coingeckoId: token.coingeckoId,
          wallet: true,
          stable: false
        })

        updateTokenList(chain, tokenList)
      }

      const logoSrc = path.join(__dirname, '..', chain, 'logos', token.address + '.png')

      if (!fs.existsSync(logoSrc)) {
        const logoBuffer = await downloadLogo(token.logoUrl)
        fs.writeFileSync(logoSrc, logoBuffer)
      }

      console.log(`Successfully added ${token.name} on ${chain}`)
    }
  }
}
