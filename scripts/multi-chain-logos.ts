#!/usr/bin/env node

/**
 * add missing logos for tokens on multiple chains
 */

import fs from 'node:fs'
import { chains } from '../index'
import type { Chain } from '../index'

main().catch(_ => console.error(_))

async function main() {
  const tokensByCoingeckoId = {} as Record<string, any>

  for (const chain in chains) {
    for (const token of chains[chain as Chain]) {
      if (token.coingeckoId) {
        if (
          !tokensByCoingeckoId[
            token.coingeckoId as keyof typeof tokensByCoingeckoId
          ]
        ) {
          tokensByCoingeckoId[token.coingeckoId] = []
        }
        tokensByCoingeckoId[token.coingeckoId].push({ ...token, chain })
      }
    }
  }

  for (const coingeckoId in tokensByCoingeckoId) {
    const tokens = tokensByCoingeckoId[coingeckoId]
    // multi chain
    if (tokens.length > 1) {
      const tokensWithLogos = []
      const tokensWithoutLogos = []

      for (const token of tokens) {
        const exists = fs.existsSync(
          `./${token.chain}/logos/${token.address}.png`
        )
        if (exists) {
          tokensWithLogos.push(token)
        } else {
          tokensWithoutLogos.push(token)
        }

        if (tokensWithLogos.length > 0 && tokensWithoutLogos.length > 0) {
          const tokenWithLogo = tokensWithLogos[0]

          for (const tokenWithoutLogo of tokensWithoutLogos) {
            fs.copyFileSync(
              `./${tokenWithLogo.chain}/logos/${tokenWithLogo.address}.png`,
              `./${tokenWithoutLogo.chain}/logos/${tokenWithoutLogo.address}.png`
            )
          }
        }
      }
    }
  }
}
