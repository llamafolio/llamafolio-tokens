const assert = require('node:assert')
const { describe, it } = require('node:test')

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
})
