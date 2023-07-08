export type Address = `0x${string}`

export type RPC_Response<T = string> = {
  jsonrpc: '2.0'
  id: number | null
  error?: { code: number; message: string }
  result: T
}
