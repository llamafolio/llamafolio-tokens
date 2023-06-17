#!/usr/bin/env bun
import { type Chain, chains } from '../index'
import { chainNamesArray, chainsIds } from './constants.js'

main().catch(_ => console.error(_))

type IncomingToken = {
  address: string
  name: string
  symbol: string
  logoURI: string
  chainId: number
  decimals: number
}

/**
 * Takes an array of tokens in the shape of {IncomingToken}[]
 * Loops through each token and adds it to the token list for the chain it belongs to
 */

async function main() {
  const tokens = await incomingTokens()

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    const chain = chainsIds[token.chainId]
    if (!chain) continue
    const tokenList = chains[chain]
    if (!tokenList) continue
    await saveLogo(chain, token)
    const exists = tokenList.find(_ => _.address.toLowerCase() === token.address.toLowerCase())
    if (exists) continue
    tokenList.push({
      address: token.address.toLowerCase(),
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      coingeckoId: null,
      wallet: true,
      stable: false
    })
  }
  
  for (let index = 0; index < chainNamesArray.length; index++) {
    const chain = chainNamesArray[index]
    const tokenList = chains[chain]
    await Bun.write(`./${chain}/tokenlist.json`, JSON.stringify(tokenList, null, 2) + '\n')
  }
}

async function incomingTokens() {
  const response = await fetch(
    /**
     * Change this URL to whatever URL you want to fetch the tokens from
     * Make sure the response is in the shape of {tokens: IncomingToken[]}
     * if it's not, then modify the code in the function above to match the shape of {tokens: IncomingToken[]}
     */
    'https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/curve.json'
    // ^ this url is just an example
  )
  const json = (await response.json()) as { tokens: IncomingToken[] }
  const { tokens } = json
  return tokens
}

async function saveLogo(chain: Chain, token: IncomingToken) {
  const logo = Bun.file(`./${chain}/logos/${token.address.toLowerCase()}.png`)
  if (logo.size > 0) return

  const response = await fetch(token.logoURI)
  const arrayBuffer = await response.arrayBuffer()
  await Bun.write(`./${chain}/logos/${token.address.toLowerCase()}.png`, arrayBuffer)
}
