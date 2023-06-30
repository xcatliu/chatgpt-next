'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useReducer } from 'react';

import { fetchApiModels } from '@/utils/api';
import { getCache, setCache } from '@/utils/cache';
import type { ChatRequest, Message } from '@/utils/constants';
import { AllModels, MAX_TOKENS, Model } from '@/utils/constants';

export interface SettingsState extends Omit<ChatRequest, 'messages'> {
  maxHistoryLength: number;
  systemMessage?: Message;
  prefixMessages?: Message[];
  availableModels: Model[];
}

const INITIAL_SETTINGS: SettingsState = {
  model: Model['gpt-3.5-turbo'],
  maxHistoryLength: 6,
  availableModels: [Model['gpt-3.5-turbo'], Model['gpt-3.5-turbo-0613']],
};

enum SettingsActionType {
  RESET,
  REPLACE_SETTINGS,
  SET_SETTINGS,
}

const settingsReducer = (settings: SettingsState, action: { type: SettingsActionType; payload?: any }) => {
  let newSettings = { ...settings };

  // 重置默认值
  if (action.type === SettingsActionType.RESET) {
    newSettings = {
      model: settings.availableModels[0],
      maxHistoryLength: settings.maxHistoryLength,
      availableModels: settings.availableModels,
    };
  }
  // 覆盖配置
  else if (action.type === SettingsActionType.REPLACE_SETTINGS) {
    newSettings = action.payload;
  }
  // 合并配置
  else if (action.type === SettingsActionType.SET_SETTINGS) {
    newSettings = { ...newSettings, ...action.payload };
    // 如果设置可用模型后发现已设置的 model 不在可用模型里，则将 model 设置为可用模型中的第一个
    // if (!newSettings.availableModels.includes(newSettings.model)) {
    //   newSettings.model = newSettings.availableModels[0];
    // }
    // 如果 max_tokens 大于最大值，则将其降低为最大值
    if (newSettings.max_tokens && newSettings.max_tokens > MAX_TOKENS[newSettings.model]) {
      newSettings.max_tokens = MAX_TOKENS[newSettings.model];
    }
  }

  setCache('settings', newSettings);
  return newSettings;
};

/**
 * 配置的 Context
 */
export const SettingsContext = createContext<{
  settings: SettingsState;
  setSettings: (partialSettings: Partial<SettingsState>) => void;
  resetSettings: () => void;
  initAvailableModels: () => void;
} | null>(null);

export const SettingsProvider: FC<{ children: ReactNode; isLogged: boolean }> = ({ children, isLogged }) => {
  const [settings, dispatch] = useReducer(settingsReducer, INITIAL_SETTINGS);

  // 页面加载后从 cache 中读取 settings
  useEffect(() => {
    let settings = {
      ...INITIAL_SETTINGS,
      ...getCache<SettingsState>('settings'),
    };

    dispatch({
      type: SettingsActionType.REPLACE_SETTINGS,
      payload: settings,
    });

    // 每次页面加载的时候都请求一次 /api/models 来获取该 apiKey 可用的模型
    if (isLogged) {
      initAvailableModels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSettings = useCallback((partialSettings: Partial<SettingsState>) => {
    dispatch({
      type: SettingsActionType.SET_SETTINGS,
      payload: partialSettings,
    });
  }, []);

  const resetSettings = useCallback(() => {
    dispatch({
      type: SettingsActionType.RESET,
    });
  }, []);

  const initAvailableModels = useCallback(async () => {
    // 请求 /api/models 来获取该 apiKey 可用的模型
    try {
      const apiModelsResponse = await fetchApiModels();

      // 需要过滤 AllModels 中的模型
      const availableModels = apiModelsResponse.data
        .map(({ id }) => id)
        .filter((model) => AllModels.includes(model))
        .sort((a, b) => AllModels.indexOf(a) - AllModels.indexOf(b));

      dispatch({
        type: SettingsActionType.SET_SETTINGS,
        payload: { availableModels },
      });
    } catch (e: any) {
      alert(e.message);
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        resetSettings,
        initAvailableModels,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
