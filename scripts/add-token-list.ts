#!/usr/bin/env node

/**
 * Add tokens / logos from a token list url
 * See: https://tokenlists.org/
 */
import fs from 'node:fs'
import buffer from 'node:buffer'
import path from 'node:path'
import url from 'node:url'

import { updateTokenList } from './update-token-list'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const chainById: { [key: number]: string } = {
  42161: 'arbitrum',
  43114: 'avalanche',
  56: 'bsc',
  42220: 'celo',
  1: 'ethereum',
  250: 'fantom',
  100: 'gnosis',
  1666600000: 'harmony',
  1284: 'moonbeam',
  10: 'optimism',
  137: 'polygon'
}

export interface TokenList {
  name: string
  description: string
  timestamp: string
  version: Version
  logoURI: string
  keywords: any[]
  tokens: Token[]
}

export interface Token {
  address: string
  name: string
  symbol: string
  logoURI: string
  chainId: number
  decimals: number
}

export interface Version {
  major: number
  minor: number
  patch: number
}

async function downloadLogo(url: string) {
  const response = await fetch(url)
  // download the image file
  const arrayBuffer = await response.arrayBuffer()
  return buffer.Buffer.from(arrayBuffer)
}

function help() {}

async function main() {
  // argv[0]: ts-node
  // argv[1]: add-token-list.ts
  // argv[2]: sourceUrl
  if (process.argv.length < 2) {
    console.error('Missing token list url')
    return help()
  }

  const sourceUrl = process.argv[2]

  const tokenListRes = await fetch(sourceUrl)
  const tokenList: TokenList = await tokenListRes.json()

  const tokensByChain: { [key: string]: any[] } = {}
  for (const token of tokenList.tokens) {
    const chain = chainById[token.chainId]
    if (!chain) {
      continue
    }

    if (!token.address || !token.name || !token.symbol || !token.decimals) {
      continue
    }

    if (!tokensByChain[chain]) {
      tokensByChain[chain] = []
    }
    tokensByChain[chain].push({
      address: token.address.toLowerCase(),
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI
    })
  }

  for (const chain in tokensByChain) {
    for (const token of tokensByChain[chain]) {
      try {
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

        if (prevAddresses.has(token.address) && !fs.existsSync(logoSrc) && token.logoUrl) {
          const logoBuffer = await downloadLogo(token.logoUrl)
          fs.writeFileSync(logoSrc, logoBuffer)
        }

        console.log(`Successfully added ${token.name} on ${chain}`)
      } catch (error) {
        console.error(`Failed to process token ${token.name} on ${chain}`, error)
      }
    }
  }
}

main().catch(_ => console.error(_))
