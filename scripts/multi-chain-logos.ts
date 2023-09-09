#!/usr/bin/env node

/**
 * add missing logos for tokens on multiple chains
 */

import fs from 'node:fs'
import { chains } from '../index'
import type { Chain } from '../index'

main().catch(_ => console.error(_))

// Note: review carefully logos as matching is done by symbol (different tokens can have the same symbol)
async function main() {
  const tokensBySymbol = {} as Record<string, any>

  for (const chain in chains) {
    for (const token of chains[chain as Chain]) {
      if (!tokensBySymbol[token.symbol]) {
        tokensBySymbol[token.symbol] = []
      }
      tokensBySymbol[token.symbol].push({ ...token, chain })
    }
  }

  for (const symbol in tokensBySymbol) {
    const tokens = tokensBySymbol[symbol]
    // multi chain
    if (tokens.length > 1) {
      const tokensWithLogos = []
      const tokensWithoutLogos = []

      for (const token of tokens) {
        const exists = fs.existsSync(`./${token.chain}/logos/${token.address}.png`)
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
