'use client';

import { useContext } from 'react';

import { SettingsContext } from '@/context/SettingsContext';
import type { Model } from '@/utils/constants';
import { MAX_TOKENS } from '@/utils/constants';

/**
 * 聊天记录
 */
export const Settings = () => {
  const { settings, setSettings, resetSettings } = useContext(SettingsContext)!;

  return (
    <div>
      <h2 className="m-4 text-lg">配置选项</h2>
      <div className="m-4">
        模型：
        <select value={settings.model} onChange={(e) => setSettings({ model: e.target.value as Model })}>
          {settings.availableModels.map((model) => (
            <option key={model}>{model}</option>
          ))}
        </select>
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
          step={512}
          min={1024}
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
      <input className="m-4 mt-0 px-3 py-2" type="button" onClick={() => resetSettings()} value="重置所有配置" />
    </div>
  );
};
