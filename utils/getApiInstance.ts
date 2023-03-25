import { env } from 'process';

import { ChatGPTAPI } from 'chatgpt';

import type { CompletionParams } from './completionParams';
import { serializeObject } from './object';

const apiInstanceMap = new Map();

/**
 * 根据传入的 apiKey 和 completionParams 返回缓存的 ChatGPTAPI 实例
 */
export function getAPIInstance(apiKey: string, completionParams?: CompletionParams): ChatGPTAPI {
  // 将 apiKey 和序列化为字符串的 completionParams 拼接起来，作为缓存的 key
  const apiKeyWithParams = `${apiKey}${serializeObject(completionParams)}`;

  // 如果缓存中已存在则直接返回该实例
  if (apiInstanceMap.has(apiKeyWithParams)) {
    return apiInstanceMap.get(apiKeyWithParams);
  }

  // 从 getOpenaiApiKeyAliasMap 中拿去真实的 apiKey
  let realApiKey = apiKey;
  const openaiApiKeyAliasMap = getOpenaiApiKeyAliasMap();
  // 如果 getOpenaiApiKeyAliasMap 中存在这个 alias，则获取其中真实的 apiKey
  if (openaiApiKeyAliasMap[apiKey]) {
    realApiKey = openaiApiKeyAliasMap[apiKey];
  }

  // 根据真实的 apiKey 创建一个新的 ChatGPTAPI 实例，并存储在缓存中
  const api = new ChatGPTAPI({ apiKey: realApiKey, completionParams });
  apiInstanceMap.set(apiKeyWithParams, api);

  return api;
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
