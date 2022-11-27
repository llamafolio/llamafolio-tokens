import fs from "fs";

export function updateTokenList(chain: string, tokens: any[]) {
  tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));

  return fs.writeFileSync(
    `./${chain}/tokenlist.json`,
    `${JSON.stringify(tokens, null, 2)}\n`
  );
}
