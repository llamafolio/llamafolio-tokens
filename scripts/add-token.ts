#!/usr/bin/env node
import fs from 'node:fs'
import buffer from 'node:buffer'
import path from 'node:path'
import url from 'node:url'

import { updateTokenList } from './update-token-list'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

main().catch(_ => console.error(_))

async function downloadLogo(url: string) {
  const response = await fetch(url)
  // download the image file
  const arrayBuffer = await response.arrayBuffer()
  return buffer.Buffer.from(arrayBuffer)
}

export const coingeckoPlatformToChain = {
  avalanche: 'avalanche',
  'binance-smart-chain': 'bsc',
  celo: 'celo',
  ethereum: 'ethereum',
  fantom: 'fantom',
  'harmony-shard-0': 'harmony',
  'polygon-pos': 'polygon',
  xdai: 'gnosis',
  'optimistic-ethereum': 'optimism',
  'arbitrum-one': 'arbitrum'
}

async function getCoingeckoTokens(id: string) {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
  const json = (await res.json()) as any

  const tokensByChain = {} as Record<string, any>

  for (const coingecko_chain in json.detail_platforms) {
    const chain =
      coingeckoPlatformToChain[
        coingecko_chain as keyof typeof coingeckoPlatformToChain
      ]
    if (!chain) {
      console.log(`Chain ${coingecko_chain} not supported yet`)
      continue
    }

    tokensByChain[chain] = {
      logoUrl: json.image.large,
      address:
        json.detail_platforms[coingecko_chain].contract_address.toLowerCase(),
      name: json.name,
      symbol: json.symbol.toUpperCase(),
      decimals: json.detail_platforms[coingecko_chain].decimal_place,
      coingeckoId: id
    }
  }

  return tokensByChain
}

function help() {}

async function main() {
  // argv[0]: ts-node
  // argv[1]: add-token.ts
  // argv[2]: source = coingecko
  // argv[3]: sourceId = coingecko id
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

  let tokensByChain = {}

  switch (source) {
    case 'coingecko':
      tokensByChain = await getCoingeckoTokens(sourceId)
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

    const logoSrc = path.join(
      __dirname,
      '..',
      chain,
      'logos',
      token.address + '.png'
    )

    if (!fs.existsSync(logoSrc)) {
      const logoBuffer = await downloadLogo(token.logoUrl)
      fs.writeFileSync(logoSrc, logoBuffer)
    }

    console.log(`Successfully added ${token.name} on ${chain}`)
  }
}
