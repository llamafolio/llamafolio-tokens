const avax = require("./avax/tokenlist.json");
const bsc = require("./bsc/tokenlist.json");
const celo = require("./celo/tokenlist.json");
const ethereum = require("./ethereum/tokenlist.json");
const fantom = require("./fantom/tokenlist.json");
const harmony = require("./harmony/tokenlist.json");
const polygon = require("./polygon/tokenlist.json");
const xdai = require("./xdai/tokenlist.json");

const chains = {
  avax,
  bsc,
  celo,
  ethereum,
  fantom,
  harmony,
  polygon,
  xdai,
};

const registries = {};
for (const chain in chains) {
  registries[chain] = {};

  for (const token of chains[chain]) {
    registries[chain][token.address] = token;
  }
}

/**
 *
 * @param {string} chain
 * @param {string} address lowercase hex string. ex: "0x0000000000000000000000000000000000000000"
 */
function getToken(chain, address) {
  if (!registries[chain]) {
    console.error(`Chain '${chain}' not supported yet`);
    return;
  }
  return registries[chain][address];
}

module.exports = {
  getToken,
  chains,
};
