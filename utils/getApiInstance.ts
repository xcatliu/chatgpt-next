import { env } from 'process';

import { ChatGPTAPI } from 'chatgpt';

const apiInstanceMap = new Map();

export function getAPIInstance(OPENAI_API_KEY: string): ChatGPTAPI {
  if (apiInstanceMap.has(OPENAI_API_KEY)) {
    return apiInstanceMap.get(OPENAI_API_KEY);
  }

  let apiKey = OPENAI_API_KEY;
  // 从 getOpenaiApiKeyAliasMap 中拿去真实的 apiKey
  const openaiApiKeyAliasMap = getOpenaiApiKeyAliasMap();
  if (openaiApiKeyAliasMap[OPENAI_API_KEY]) {
    apiKey = openaiApiKeyAliasMap[OPENAI_API_KEY];
  }

  const api = new ChatGPTAPI({ apiKey });
  apiInstanceMap.set(OPENAI_API_KEY, api);

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
