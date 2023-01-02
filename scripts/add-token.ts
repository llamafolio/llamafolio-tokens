import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { updateTokenList } from "./update-token-list";

async function downloadLogo(url: string) {
  const response = await fetch(url);
  return response.buffer();
}

export const coingeckoPlatformToChain = {
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

async function getCoingeckoTokens(id: string) {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
  const json = await res.json();

  const tokensByChain = {};

  for (const coingecko_chain in json.detail_platforms) {
    const chain = coingeckoPlatformToChain[coingecko_chain];
    if (!chain) {
      console.log(`Chain ${coingecko_chain} not supported yet`);
      continue;
    }

    tokensByChain[chain] = {
      logoUrl: json.image.large,
      address:
        json.detail_platforms[coingecko_chain].contract_address.toLowerCase(),
      name: json.name,
      symbol: json.symbol.toUpperCase(),
      decimals: json.detail_platforms[coingecko_chain].decimal_place,
      coingeckoId: id,
    };
  }

  return tokensByChain;
}

function help() {}

async function main() {
  // argv[0]: ts-node
  // argv[1]: add-token.ts
  // argv[2]: source = coingecko
  // argv[3]: sourceId = coingecko id
  if (process.argv.length < 3) {
    console.error("Missing source");
    return help();
  }
  if (process.argv.length < 4) {
    console.error("Missing source id");
    return help();
  }

  const source = process.argv[2];
  const sourceId = process.argv[3];

  let tokensByChain = {};

  switch (source) {
    case "coingecko":
      tokensByChain = await getCoingeckoTokens(sourceId);
      break;

    case "defillama":
      break;

    default:
      console.error(`Source ${source} not supported.`);
      return help();
  }

  for (const chain in tokensByChain) {
    const token = tokensByChain[chain];

    const tokenListSrc = path.join(__dirname, "..", chain, "tokenlist.json");
    const tokenListBuffer = fs.readFileSync(tokenListSrc, "utf8");
    const tokenList = JSON.parse(tokenListBuffer);

    const prevAddresses = new Set(tokenList.map((token) => token.address));

    if (!prevAddresses.has(token.address)) {
      tokenList.push({
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        coingeckoId: token.coingeckoId,
        wallet: true,
        stable: false,
      });

      updateTokenList(chain, tokenList);
    }

    const logoSrc = path.join(
      __dirname,
      "..",
      chain,
      "logos",
      token.address + ".png"
    );

    if (!fs.existsSync(logoSrc)) {
      const logoBuffer = await downloadLogo(token.logoUrl);
      fs.writeFileSync(logoSrc, logoBuffer);
    }

    console.log(`Successfully added ${token.name} on ${chain}`);
  }
}

main();
