#!/usr/bin/env bash

set -eou pipefail

CHAIN=$1

if [ -z "$CHAIN" ]; then
  echo "Usage: $0 <chain-name>"
  exit 1
fi

# if chain dir exists, exit and print error + empty lines
if [ -d "$CHAIN" ]; then
  echo >&2 && echo "   Chain $CHAIN already exists" >&2 && echo
  exit 1
fi

mkdir -p $CHAIN
mkdir -p $CHAIN/logos
mkdir -p $CHAIN/logos-sm

cat <<'EOF' >$CHAIN/tokenlist.json
[
  {
    "address": "",
    "name": "",
    "symbol": "",
    "decimals": 0,
    "coingeckoId": "",
    "wallet": true,
    "stable": false
  }
]
EOF
