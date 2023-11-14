'use client';

import { useContext } from 'react';

import { ChatContext } from '@/context/ChatContext';
import { SettingsContext } from '@/context/SettingsContext';
import type { Model } from '@/utils/constants';
import { AllModels, MAX_TOKENS, MIN_TOKENS, Role } from '@/utils/constants';

/**
 * 聊天记录
 */
export const Settings = () => {
  const { settings, setSettings, resetSettings } = useContext(SettingsContext)!;
  const { historyIndex } = useContext(ChatContext)!;

  return (
    <div>
      <h2 className="m-4 text-lg">配置选项</h2>
      <div className="m-4">
        模型：
        <select
          value={settings.model}
          onChange={(e) => setSettings({ model: e.target.value as Model })}
          disabled={historyIndex !== 'empty'}
        >
          {AllModels.map((model) => (
            <option key={model} disabled={!settings.availableModels.includes(model)}>
              {model}
            </option>
          ))}
        </select>
        {historyIndex !== 'empty' && <p className="mt-1 ml-12 text-sm text-gray">已开启的对话不支持修改模型</p>}
      </div>
      <div className="m-4">
        历史长度：
        <input
          className="w-36 mr-2"
          type="range"
          step={2}
          min={0}
          max={20}
          value={settings.maxHistoryLength}
          onChange={(e) => setSettings({ maxHistoryLength: Number(e.target.value) })}
        />
        {settings.maxHistoryLength}
      </div>
      <div className="m-4">
        温度：
        <input
          className="w-36 mr-2"
          type="range"
          step={0.1}
          min={0}
          max={2}
          value={settings.temperature ?? 1}
          onChange={(e) => setSettings({ temperature: Number(e.target.value) })}
        />
        {settings.temperature ?? 1}
      </div>
      <div className="m-4">
        top_p：
        <input
          className="w-36 mr-2"
          type="range"
          step={0.1}
          min={0}
          max={1}
          value={settings.top_p ?? 1}
          onChange={(e) => setSettings({ top_p: Number(e.target.value) })}
        />
        {settings.top_p ?? 1}
      </div>
      <div className="m-4">
        tokens 限制：
        <input
          className="w-36 mr-2"
          type="range"
          step={(MAX_TOKENS[settings.model] - MIN_TOKENS[settings.model]) / 1024 < 7 ? 512 : 1024}
          min={MIN_TOKENS[settings.model]}
          max={MAX_TOKENS[settings.model]}
          value={settings.max_tokens ?? MAX_TOKENS[settings.model]}
          onChange={(e) => setSettings({ max_tokens: Number(e.target.value) })}
        />
        {settings.max_tokens ?? MAX_TOKENS[settings.model]}
      </div>
      <div className="m-4">
        存在惩罚：
        <input
          className="w-36 mr-2"
          type="range"
          step={0.1}
          min={-2}
          max={2}
          value={settings.presence_penalty ?? 0}
          onChange={(e) => setSettings({ presence_penalty: Number(e.target.value) })}
        />
        {settings.presence_penalty ?? 0}
      </div>
      <div className="m-4">
        频率惩罚：
        <input
          className="w-36 mr-2"
          type="range"
          step={0.1}
          min={-2}
          max={2}
          value={settings.frequency_penalty ?? 0}
          onChange={(e) => setSettings({ frequency_penalty: Number(e.target.value) })}
        />
        {settings.frequency_penalty ?? 0}
      </div>
      <div className="m-4">
        系统消息：
        <input
          className="block px-3 py-2 my-2 w-full border border-gray"
          type="text"
          value={settings.systemMessage?.content ?? ''}
          onChange={(e) => {
            if (e.target.value === '') {
              setSettings({ systemMessage: undefined });
            } else {
              setSettings({ systemMessage: { role: Role.system, content: e.target.value } });
            }
          }}
        />
      </div>
      <div className="m-4">
        前置消息：
        <input
          className="block px-3 py-2 my-2 w-full border border-gray"
          type="text"
          value={settings.prefixMessages?.[0].content ?? ''}
          onChange={(e) => {
            if (e.target.value === '') {
              setSettings({ prefixMessages: undefined });
            } else {
              setSettings({ prefixMessages: [{ role: Role.user, content: e.target.value }] });
            }
          }}
        />
      </div>
      <input className="m-4 mt-0 px-3 py-2" type="button" onClick={() => resetSettings()} value="重置所有配置" />
    </div>
  );
};
