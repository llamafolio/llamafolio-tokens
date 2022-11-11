import fs from "fs";
import fetch from "node-fetch";
import childProcess from "child_process"

import path from "path";
import { coingeckoPlatformToChain } from './add-token';

const supportedChains = Object.values(coingeckoPlatformToChain)

async function main() {
  const stablecoinsRes = await fetch(
    "https://stablecoins.llama.fi/stablecoins"
  );
  const stablecoins = await stablecoinsRes.json();

  const peggedAssets = stablecoins.peggedAssets;
  const peggedAssetsGeckoIds = new Set(
    peggedAssets.map((asset) => asset.gecko_id)
  );


  for (const chainId of supportedChains) {
    const tokenListSrc = path.join(__dirname, "..", chainId, "tokenlist.json");
    const oldTokenList = JSON.parse(fs.readFileSync(tokenListSrc, "utf8"));

    const allStablesForTheChain = peggedAssets.filter(stable => stable.chains.some(chain => chain.toLowerCase() === chainId))
    const missingStables = allStablesForTheChain.filter(stable => oldTokenList.every(token => token.symbol !== stable.symbol))

    const tokenUpdateProcess = missingStables.map(token => {
      console.log(`> Adding ${token.symbol} for ${chainId}`)

      const process = childProcess.fork(path.join(__dirname, "add-token.ts"), ['coingecko', token.gecko_id])

      return new Promise((res, rej) => {
        process.on('exit', res)
        process.on('error', rej)
      })
    })

    await Promise.all(tokenUpdateProcess)

    const updatedTokenList = JSON.parse(fs.readFileSync(tokenListSrc, "utf8"));

    const newTokenList = updatedTokenList.map((token) => {
      // if the token is known as stable, mark it.
      // if not, leave it undefined
      if (token.coingeckoId && peggedAssetsGeckoIds.has(token.coingeckoId)) {
        token.stable = true;
        token.wallet = true;
      }
      return token;
    });

    fs.writeFileSync(
      `./${chainId}/tokenlist.json`,
      `${JSON.stringify(newTokenList, null, 2)}\n`
    );
  }
}

main();
