'use client';

import { Model } from '@/utils/constants';

/**
 * 聊天记录
 */
export const Settings = () => {
  const models = [Model['gpt-3.5-turbo-0301']];

  return (
    <div>
      <div className="m-4">
        模型：
        <select value={models[0]}>
          {models.map((model) => (
            <option key={model}>{model}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
