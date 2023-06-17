import type { Chain } from '../index.js'

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
