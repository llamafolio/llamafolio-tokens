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
    new Promise((resolve) => setTimeout(resolve, milliseconds))
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds)
}