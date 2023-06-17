#!/usr/bin/env bun

export function updateTokenList(chain: string, tokens: any[]) {
  const tokenByAddress: { [key: string]: any } = {}

  for (const token of tokens) {
    token.address = token.address.toLowerCase()
    tokenByAddress[token.address] = token
  }

  const uniqueTokens = Object.values(tokenByAddress)

  uniqueTokens.sort((a, b) => a.symbol.localeCompare(b.symbol))

  return Bun.write(`./${chain}/tokenlist.json`, `${JSON.stringify(uniqueTokens, null, 2)}\n`)
}
