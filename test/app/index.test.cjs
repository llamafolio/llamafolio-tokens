const assert = require('node:assert')
const { describe, it } = require('node:test')

// don't run this test in CI
if (process.env.CI) process.exit(0)

describe('@llamafolio/tokens', async () => {
  it('should be an object', async () => {
    const tokens = await import('@llamafolio/tokens')
    assert(typeof tokens === 'object')
  })
  it('should have a chains property', async () => {
    const tokens = await import('@llamafolio/tokens')
    assert(typeof tokens.chains === 'object')
  })
  it('should have an arbitrum property', async () => {
    const tokens = await import('@llamafolio/tokens')
    assert(typeof tokens.chains.arbitrum === 'object')
  })
  it('should have an array of > 0 tokens in arbitrum', async () => {
    const tokens = await import('@llamafolio/tokens')
    assert(tokens.chains.arbitrum.length > 0)
  })

  it('should retrieve token with symbol "DAI" from "ethereum"', async () => {
    const { getToken } = await import('@llamafolio/tokens')
    const token = getToken('ethereum', '0x6b175474e89094c44da98b954eedeac495271d0f')
    assert(typeof token === 'object')
    assert(token.symbol === 'DAI')
  })
})
