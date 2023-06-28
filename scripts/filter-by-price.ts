#!/usr/bin/env bun

import { chains as tokensChins, chainNames } from '../index.js'
import { Chain } from '../index.js'
import { arrayToChunks } from './utilities.js'

console.info(
  `/**
  * This loops through tokenlist and filters out tokens that llama price api doesn't support
  */`
)

main()
  .then(console.log)
  .catch(_ => {
    console.error(_)
    process.exit(1)
  })
  .finally(() => process.exit(0))

async function main(chain = process.argv[2]) {
  const chains = (process.argv[2] ? [process.argv[2]] : chainNames) as Array<Chain>

  for (const chain of chains) {
    const tokens = tokensChins[chain]
    console.log(tokens.length)
    const llamaPriceChain = chain === 'avalanche' ? 'avax' : chain
    const withPriceId = tokens.map(({ address, ...token }) => ({
      address,
      ...token,
      priceId: `${llamaPriceChain}:${address}`
    }))
    const coinsParam = withPriceId.map(({ priceId }) => priceId)
    const chunks = arrayToChunks(coinsParam, 150)

    const results = await Promise.all(chunks.map(fetchPrices))
    const prices = results.map(item => item.coins).flatMap(item => Object.entries(item))
    const returnedAddresses = prices.map(([chainAaddress, { price }]) => chainAaddress.split(':')[1])

    console.log(returnedAddresses, returnedAddresses.length)

    // filter out tokens tokens whose address is not in returnedAddresses
    const filtered = tokens.filter(({ address }) => returnedAddresses.includes(address))

    console.log(filtered.length, tokens.length)

    await Bun.write(`${chain}/tokenlist.json`, JSON.stringify(filtered, null, 2) + '\n')
  }
}

export async function fetchPrices(params: Array<string>) {
  const coinParams = params.join(',')

  const pricesResponse = await fetch(`https://coins.llama.fi/prices/current/${coinParams}`, {
    method: 'GET'
  })

  const prices = (await pricesResponse.json()) as {
    coins: Record<string, { decimals: number; symbol: string; price: number; timestamp: number; confidence: number }>
  }

  return prices
}
