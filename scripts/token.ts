#!/usr/bin/env bun
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'

import { type Chain, chains, Token } from '../index.js'
import { rpcURL } from './constants.js'
import { RPC_Response } from './types.js'
import { arrayToChunks, invariant, isAddress } from './utilities.js'

/**
 * this is `select address from adapters_contracts where adapter_id <> 'wallet';`
 * exported as JSON then formatted to array of addresses
 */
import dbContracts from '../db-contracts.json'

// https://www.4byte.directory/
const erc20Methods = {
  balanceOf: {
    signature: '0x70a08231',
    decode: data => (!data || data === '0x' ? '' : parseInt(data, 16).toString())
  },
  decimals: {
    signature: '0x313ce567',
    decode: data => (!data || data === '0x' ? '' : parseInt(data, 16).toString())
  },
  symbol: {
    signature: '0x95d89b41',
    decode: data =>
      !data || data === '0x'
        ? ''
        : Buffer.from(data.substring(2 + 64 * 2), 'hex')
            .toString('ascii')
            .replace(/\0/g, '')
  },
  name: {
    signature: '0x06fdde03',
    decode: data =>
      !data || data === '0x'
        ? ''
        : Buffer.from(data.substring(2 + 64 * 2), 'hex')
            .toString('ascii')
            .replace(/\0/g, '')
  },
  totalSupply: {
    signature: '0x18160ddd',
    decode: data => (!data || data === '0x' ? '' : parseInt(data, 16).toString())
  }
} satisfies {
  [key: string]: {
    signature: string
    decode: (data: string | undefined) => string
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})

async function main(addresses: Array<string> = process.argv.slice(2)) {
  addresses = addresses.length ? addresses : require('../tokens.json')

  // split addresses into chains
  const chainsTokens: { [chain: string]: Array<string> } = {}
  for (const chainAddress of addresses) {
    const [chain, address] = chainAddress.split('-')
    chainsTokens[chain] = chainsTokens[chain] || []
    chainsTokens[chain].push(address)
  }

  for (const chainTokens in chainsTokens) {
    const chain = chainTokens as Chain
    const tokens = chainsTokens[chain]

    const tokensInfo = await batchRpcTokensInfo({ chain, addresses: tokens })
    const { default: existingTokenList } = await import(`../${chain}/tokenlist.json`)
    const existingTokenListAddresses = existingTokenList.map((token: Token) => token.address.toLowerCase())

    const filteredTokensInfo = tokensInfo.filter(
      token =>
        !(token.address.toLowerCase() in dbContracts) &&
        !existingTokenListAddresses.includes(token.address.toLowerCase()) &&
        token.name.length > 0 &&
        token.symbol.length > 0 &&
        token.decimals.length > 0 &&
        ['farm', 'lp', 'pool', 'vault', 'stake', 'staked'].every(word => !token.symbol.toLowerCase().includes(word)) &&
        ['farm', 'lp', 'pool', 'vault', 'stake', 'staked'].every(word => !token.name.toLowerCase().includes(word)) &&
        !/yv\w{2,}/i.test(token.name.toLowerCase()) &&
        !/yv\w{2,}/i.test(token.symbol.toLowerCase())
    )
    console.log('chain', tokensInfo.length, filteredTokensInfo.length)
    const newTokenList = [...existingTokenList, ...filteredTokensInfo]
    await fs.writeFile(`./${chain}/tokenlist.json`, JSON.stringify(newTokenList, null, 2))
  }
}

/* Given a chain and an array of contract addresses, check `symbol()`, `name()` and `decimals()` of each contract. */
export async function batchRpcTokensInfo({ chain, addresses }: { chain: Chain; addresses: Array<string> }): Promise<
  Array<{
    address: string
    symbol: string
    name: string
    decimals: string
    stable: boolean
  }>
> {
  if (!(chain in chains)) throw new Error('invalid chain')
  addresses.map(address => invariant(isAddress(address), `invalid address ${address}`))

  const rpc = rpcURL(chain)

  // max requests per batch is 1000 (each address has name, symbol and decimals)
  if (addresses.length * 3 >= 1_000) {
    const arrayChunks = arrayToChunks(addresses, 333)
    // recursive call
    const results = await Promise.all(
      arrayChunks.map(async chunk => await batchRpcTokensInfo({ chain, addresses: chunk }))
    )
    return results.flat()
  }

  let jsonRpcId = 0
  const response = await fetch(rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      addresses
        .map(address => [
          {
            jsonrpc: '2.0',
            id: jsonRpcId++,
            method: 'eth_call',
            params: [{ to: address, data: erc20Methods['symbol'].signature }, 'latest']
          },
          {
            jsonrpc: '2.0',
            id: jsonRpcId++,
            method: 'eth_call',
            params: [{ to: address, data: erc20Methods['name'].signature }, 'latest']
          },
          {
            jsonrpc: '2.0',
            id: jsonRpcId++,
            method: 'eth_call',
            params: [{ to: address, data: erc20Methods['decimals'].signature }, 'latest']
          }
        ])
        .flat()
    )
  })
  invariant(response.ok, `HTTP error! status: ${response.status} ${response.statusText}`)

  const data = await response.json<Array<RPC_Response>>()
  const decodedResults: Awaited<ReturnType<typeof batchRpcTokensInfo>> = []

  for (let index = 0; index < data.length; index += 3) {
    const address = addresses[index / 3]
    const symbol = erc20Methods['symbol'].decode(data[index].result)
    const name = erc20Methods['name'].decode(data[index + 1].result)
    const decimals = erc20Methods['decimals'].decode(data[index + 2].result)

    decodedResults.push({
      address,
      symbol,
      name,
      decimals,
      stable: name.toLowerCase().includes('usd') || symbol.toLowerCase().includes('usd')
    })
  }
  return decodedResults
}
