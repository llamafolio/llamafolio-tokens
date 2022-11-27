import fetch from "node-fetch";
import { chains } from "../index";
import { updateTokenList } from "./update-token-list";

export const coingeckoPlatformToChain: { [key: string]: string } = {
  avalanche: "avax",
  "binance-smart-chain": "bsc",
  celo: "celo",
  ethereum: "ethereum",
  fantom: "fantom",
  "harmony-shard-0": "harmony",
  "polygon-pos": "polygon",
  xdai: "xdai",
  "optimistic-ethereum": "optimism",
  "arbitrum-one": "arbitrum",
};

async function getCoingeckoIds(
  chainTokens: Partial<Record<string, Record<string, any>>>
) {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/list?include_platform=true"
  );
  const coins = await res.json();

  for (const coin of coins) {
    if (coin.platforms) {
      for (const coingecko_chain in coin.platforms) {
        const chain = coingeckoPlatformToChain[coingecko_chain];
        if (!chain) {
          console.log(`Chain ${coingecko_chain} not supported yet`);
          continue;
        }

        const token =
          chainTokens[chain]?.[coin.platforms[coingecko_chain].toLowerCase()];
        if (token) {
          token.coingeckoId = coin.id;
        }
      }
    }
  }

  return chainTokens;
}

async function main() {
  const chainsTokens: Partial<Record<string, Record<string, any>>> = {};

  for (const chain in chains) {
    chainsTokens[chain] = {};

    for (const token of chains[chain]) {
      chainsTokens[chain]![token.address] = token;
    }
  }

  await getCoingeckoIds(chainsTokens);

  for (const chain in chains) {
    const tokens = Object.values(chainsTokens[chain]!);

    updateTokenList(chain, tokens);
  }
}

main();
