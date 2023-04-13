import { env } from './env';

/**
 * 传入的 apiKey 可能是 alias，这个函数会返回真正的 apiKey
 */
export function getApiKey(apiKey?: string): string | undefined {
  if (!apiKey) {
    return undefined;
  }

  // 从 getOpenaiApiKeyAliasMap 中拿取真实的 apiKey
  let realApiKey = apiKey;
  const openaiApiKeyAliasMap = getOpenaiApiKeyAliasMap();
  // 如果 getOpenaiApiKeyAliasMap 中存在这个 alias，则获取其中真实的 apiKey
  if (openaiApiKeyAliasMap[apiKey]) {
    realApiKey = openaiApiKeyAliasMap[apiKey];
    return realApiKey;
  }

  // 如果禁止了陌生人通过他自己的 apiKey 访问
  if (env.CHATGPT_NEXT_DISABLE_PUBLIC === 'true') {
    return undefined;
  }

  return realApiKey;
}

/**
 * 根据配置的环境变量 OPENAI_API_KEY_ALIAS，获取 alias 配置
 */
function getOpenaiApiKeyAliasMap() {
  if (!env.OPENAI_API_KEY_ALIAS) {
    return {};
  }

  let openaiApiKeyAliasMap: Record<string, string> = {};

  /**
   * alias 是这样的结构 firstkey:sk-xxxx|secondkey:sk-yyyy
   * 这里通过两轮 split 来拆分成多组 alias
   */
  const aliasList = env.OPENAI_API_KEY_ALIAS.split('|');
  for (const oneAlias of aliasList) {
    const [key, value] = oneAlias.split(':');
    openaiApiKeyAliasMap[key] = value;
  }

  return openaiApiKeyAliasMap;
}
