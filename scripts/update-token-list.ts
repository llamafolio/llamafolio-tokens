#!/usr/bin/env node
import fs from 'node:fs'

export function updateTokenList(chain: string, tokens: any[]) {
  const tokenByAddress: { [key: string]: any } = {}

  for (const token of tokens) {
    token.address = token.address.toLowerCase()
    tokenByAddress[token.address] = token
  }

  const uniqueTokens = Object.values(tokenByAddress)

  uniqueTokens.sort((a, b) => a.symbol.localeCompare(b.symbol))

  return fs.writeFileSync(
    `./${chain}/tokenlist.json`,
    `${JSON.stringify(uniqueTokens, null, 2)}\n`
  )
}
