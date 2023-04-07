import { env } from 'process';

/**
 * 传入的 apiKey 可能是 alias，这个函数会返回真正的 apiKey
 */
export function getApiKey(apiKey: string): string {
  // 从 getOpenaiApiKeyAliasMap 中拿取真实的 apiKey
  let realApiKey = apiKey;
  const openaiApiKeyAliasMap = getOpenaiApiKeyAliasMap();
  // 如果 getOpenaiApiKeyAliasMap 中存在这个 alias，则获取其中真实的 apiKey
  if (openaiApiKeyAliasMap[apiKey]) {
    realApiKey = openaiApiKeyAliasMap[apiKey];
  }

  return realApiKey;
}

/**
 * 根据配置的环境变量 OPENAI_API_KEY_ALIAS，获取 alias 配置
 */
function getOpenaiApiKeyAliasMap() {
  const envValue = env.OPENAI_API_KEY_ALIAS;
  if (!envValue) {
    return {};
  }

  let openaiApiKeyAliasMap: Record<string, string> = {};

  /**
   * alias 是这样的结构 firstkey:sk-xxxx|secondkey:sk-yyyy
   * 这里通过两轮 split 来拆分成多组 alias
   */
  const aliasList = envValue.split('|');
  for (const oneAlias of aliasList) {
    const [key, value] = oneAlias.split(':');
    openaiApiKeyAliasMap[key] = value;
  }

  return openaiApiKeyAliasMap;
}
