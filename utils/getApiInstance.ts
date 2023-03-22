import { env } from 'process';

import { ChatGPTAPI, ChatGPTAPIOptions } from 'chatgpt';

import { serializeObject } from './serializeObject';

const apiInstanceMap = new Map();

export function getAPIInstance(apiKey: string, completionParams: ChatGPTAPIOptions['completionParams']): ChatGPTAPI {
  const apiKeyWithParams = `${apiKey}${serializeObject(completionParams)}`;

  if (apiInstanceMap.has(apiKeyWithParams)) {
    return apiInstanceMap.get(apiKeyWithParams);
  }

  // 从 getOpenaiApiKeyAliasMap 中拿去真实的 apiKey
  let realApiKey = apiKey;
  const openaiApiKeyAliasMap = getOpenaiApiKeyAliasMap();
  if (openaiApiKeyAliasMap[apiKey]) {
    realApiKey = openaiApiKeyAliasMap[apiKey];
  }

  const api = new ChatGPTAPI({ apiKey: realApiKey, completionParams });
  apiInstanceMap.set(apiKeyWithParams, api);

  return api;
}

function getOpenaiApiKeyAliasMap() {
  const envValue = env.OPENAI_API_KEY_ALIAS;
  if (!envValue) {
    return {};
  }

  let openaiApiKeyAliasMap: Record<string, string> = {};

  const aliasList = envValue.split('|');
  for (const oneAlias of aliasList) {
    const [key, value] = oneAlias.split(':');
    openaiApiKeyAliasMap[key] = value;
  }

  return openaiApiKeyAliasMap;
}
