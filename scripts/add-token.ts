import path from "path";
import fs from "fs";
import fetch from "node-fetch";

const coingeckoPlatformToChain = {
  avalanche: "avax",
  "binance-smart-chain": "bsc",
  celo: "celo",
  ethereum: "ethereum",
  fantom: "fantom",
  "harmony-shard-0": "harmony",
  "polygon-pos": "polygon",
  xdai: "xdai",
};

async function getCoingeckoTokens(id: string) {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
  const json = await res.json();

  const tokensByChain = {};

  for (const coingecko_chain in json.detail_platforms) {
    const chain = coingeckoPlatformToChain[coingecko_chain];
    if (!chain) {
      console.log(`Chain ${coingecko_chain} not supported yet`);
    }

    tokensByChain[chain] = {
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

  console.log(tokensByChain);

  for (const chain in tokensByChain) {
    const newToken = tokensByChain[chain];

    const src = path.join(__dirname, "..", chain, "tokenlist.json");

    const buff = fs.readFileSync(src, "utf8");
    const tokenList = JSON.parse(buff);

    const prevAddresses = new Set(tokenList.map((token) => token.address));

    if (prevAddresses.has(newToken.address)) {
      console.log(`Failed to add ${newToken.name} on ${chain}: already exists`);
      continue;
    }

    tokenList.push(newToken);

    fs.writeFileSync(src, JSON.stringify(tokenList, null, 2));
    console.log(`Successfully added ${newToken.name} on ${chain}`);
  }
}

main();
