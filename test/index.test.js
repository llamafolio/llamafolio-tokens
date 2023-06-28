import assert from 'node:assert'
import { describe, it } from 'node:test'
import * as tokens from '../build/index.js'

describe('@llamafolio/tokens', () => {
  it('should be an object', () => {
    assert(typeof tokens === 'object')
  })
  it('should have a chains property', () => {
    assert(typeof tokens.chains === 'object')
  })
  it('should have an arbitrum property', () => {
    assert(typeof tokens.chains.arbitrum === 'object')
  })
  it('should have an array of > 0 tokens in arbitrum', () => {
    assert(tokens.chains.arbitrum.length > 0)
  })

  it('should retrieve token with symbol "DAI" from "ethereum"', () => {
    const token = tokens.getToken('ethereum', '0x6b175474e89094c44da98b954eedeac495271d0f')
    assert(typeof token === 'object')
    assert(token.symbol === 'DAI')
  })
})
