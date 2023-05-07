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
})
