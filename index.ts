import arbitrum from './arbitrum/tokenlist.json'
import arbitrumNova from './arbitrum-nova/tokenlist.json'
import avalanche from './avalanche/tokenlist.json'
import bsc from './bsc/tokenlist.json'
import base from './base/tokenlist.json'
import celo from './celo/tokenlist.json'
import ethereum from './ethereum/tokenlist.json'
import fantom from './fantom/tokenlist.json'
import gnosis from './gnosis/tokenlist.json'
import harmony from './harmony/tokenlist.json'
import moonbeam from './moonbeam/tokenlist.json'
import optimism from './optimism/tokenlist.json'
import polygon from './polygon/tokenlist.json'
import polygonZkevm from './polygon-zkevm/tokenlist.json'
import zksyncEra from './zksync-era/tokenlist.json'

export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  stable: boolean
}

export interface ChainToken extends Token {
  chain: string
}

export type ChainTokenRegistry = { [key: string]: ChainToken }

export const chainNames = [
  'arbitrum',
  'arbitrum-nova',
  'avalanche',
  'bsc',
  'base',
  'celo',
  'ethereum',
  'fantom',
  'gnosis',
  'harmony',
  'moonbeam',
  'optimism',
  'polygon',
  'polygon-zkevm',
  'zksync-era'
] as const

export type Chain = (typeof chainNames)[number]

export const chains: { [chain in Chain]: Token[] } = {
  arbitrum,
  'arbitrum-nova': arbitrumNova,
  avalanche,
  bsc,
  base,
  celo,
  ethereum,
  fantom,
  gnosis,
  harmony,
  moonbeam,
  optimism,
  polygon,
  'polygon-zkevm': polygonZkevm,
  'zksync-era': zksyncEra
}

const registries: { [chain: string]: ChainTokenRegistry } = {}

for (const chain in chains) {
  const registry: ChainTokenRegistry = (registries[chain] = {})
  for (const token of chains[chain as Chain]) {
    registry[token.address] = { ...token, chain }
  }
}

/**
 * @param {Chain} chain name. ex: "ethereum"
 * @param {string} address lowercase hex string. ex: "0x0000000000000000000000000000000000000000"
 */
export function getToken(chain: Chain, address: string = '0x0000000000000000000000000000000000000000') {
  if (!registries[chain]) {
    console.error(`Chain '${chain}' not supported yet`)
    return
  }
  return registries[chain][address]
}
