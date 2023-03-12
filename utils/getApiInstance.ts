import { ChatGPTAPI } from 'chatgpt';

const apiInstanceMap = new Map();

export function getAPIInstance(OPENAI_API_KEY: string): ChatGPTAPI {
  if (apiInstanceMap.has(OPENAI_API_KEY)) {
    return apiInstanceMap.get(OPENAI_API_KEY);
  }

  const api = new ChatGPTAPI({
    apiKey: OPENAI_API_KEY,
  });
  apiInstanceMap.set(OPENAI_API_KEY, api);

  return api;
}
