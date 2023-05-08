import arbitrum from './arbitrum/tokenlist.json'
import avalanche from './avalanche/tokenlist.json'
import bsc from './bsc/tokenlist.json'
import celo from './celo/tokenlist.json'
import ethereum from './ethereum/tokenlist.json'
import fantom from './fantom/tokenlist.json'
import gnosis from './gnosis/tokenlist.json'
import harmony from './harmony/tokenlist.json'
import optimism from './optimism/tokenlist.json'
import polygon from './polygon/tokenlist.json'

export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  coingeckoId: string | null
  wallet: boolean
  stable: boolean
  native?: boolean
}

export interface ChainToken extends Token {
  chain: string
}

export type ChainTokenRegistry = { [key: string]: ChainToken }

export const chains = {
  arbitrum,
  avalanche,
  bsc,
  celo,
  ethereum,
  fantom,
  gnosis,
  harmony,
  optimism,
  polygon
} satisfies { [chain: string]: Token[] }

export type Chain = keyof typeof chains

const registries: { [chain: string]: ChainTokenRegistry } = {}

for (const chain in chains) {
  const registry: ChainTokenRegistry = (registries[chain] = {})

  for (const token of chains[chain as Chain]) {
    registry[token.address] = { ...token, chain }
  }
}

/**
 * @param chain
 * @param address lowercase hex string. ex: "0x0000000000000000000000000000000000000000"
 */
export function getToken(
  chain: string,
  address: string = '0x0000000000000000000000000000000000000000'
) {
  if (!registries[chain]) {
    console.error(`Chain '${chain}' not supported yet`)
    return
  }
  return registries[chain][address]
}
