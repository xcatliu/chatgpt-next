export const env = {
  NODE_ENV: process.env.NODE_ENV,

  /** apiKey 別名 */
  OPENAI_API_KEY_ALIAS: process.env.OPENAI_API_KEY_ALIAS ?? undefined,

  /** 禁止陌生人通过他自己的 apiKey 访问 */
  CHATGPT_NEXT_DISABLE_PUBLIC: process.env.CHATGPT_NEXT_DISABLE_PUBLIC ?? 'false',

  /** 配置 API 请求的 host（包含端口） */
  CHATGPT_NEXT_API_HOST: process.env.CHATGPT_NEXT_API_HOST ?? 'api.openai.com',

  /** API提供商: openai/azure */
  CHATGPT_NEXT_API_PROVIDER: process.env.CHATGPT_NEXT_API_PROVIDER ?? 'openai',
  /** azure api url */
  CHATGPT_NEXT_API_AzureAPIURL: process.env.CHATGPT_NEXT_API_AzureAPIURL,
  /** azure api url path */
  CHATGPT_NEXT_API_AzureAPIURLPath: process.env.CHATGPT_NEXT_API_AzureAPIURLPath,
};
