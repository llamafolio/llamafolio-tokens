import type { Chain } from '../index.js'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000' satisfies `0x${string}`

export const chainsIds = {
  '1': 'ethereum',
  '56': 'bsc',
  '137': 'polygon',
  '250': 'fantom',
  '100': 'gnosis',
  '42220': 'celo',
  '42161': 'arbitrum',
  '10': 'optimism',
  '1287': 'moonbeam',
  '43114': 'avalanche',
  '1666600000': 'harmony'
} as Record<string, Chain>

export const chainNamesArray = Object.values(chainsIds) as Array<Chain>

export const rpcURL = (chain: Chain) =>
  chain === 'ethereum'
    ? `https://eth.llamarpc.com/rpc/${process.env.LLAMANODES_API_KEY}`
    : chain === 'polygon'
    ? `https://polygon.llamarpc.com/rpc/${process.env.LLAMANODES_API_KEY}`
    : `https://rpc.ankr.com/${chain}`
