import type { Address } from './types.js'

const addressRegex = /^0x[a-fA-F0-9]{40}$/

export const isAddress = (address: string): address is Address => addressRegex.test(address)

export function invariant(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    const error = new Error(message ?? 'Invariant violation')
    Error.captureStackTrace?.(error, invariant)
    throw error
  }
}

export function arrayToChunks<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < array.length; index += chunkSize) {
    chunks.push(array.slice(index, index + chunkSize))
  }
  return chunks
}

// https://jasonformat.com/javascript-sleep/
export function sleep(milliseconds: number): void {
  if (typeof Atomics === 'undefined') {
    new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds)
}
