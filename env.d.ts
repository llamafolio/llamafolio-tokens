declare module NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    LLAMANODES_API_KEY: string
  }
}
