// 参考 https://github.com/openai/openai-node/blob/master/api.ts
export enum Role {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

export enum Model {
  'gpt-3.5-turbo' = 'gpt-3.5-turbo',
  'gpt-3.5-turbo-0301' = 'gpt-3.5-turbo-0301',
  'gpt-4' = 'gpt-4',
  'gpt-4-0314' = 'gpt-4-0314',
  'gpt-4-32k' = 'gpt-4-32k',
  'gpt-4-32k-0314' = 'gpt-4-32k-0314',
}

export interface Message {
  isError?: boolean;
  role: Role;
  content: string;
}

export interface ChatRequest {
  /**
   * 模型
   */
  model: Model;
  /**
   * 消息
   * 一般第一条消息是 system，后面是 user 或 assistant
   *
   * @example
   * [
   *   {"role": "system", "content": "You are a helpful assistant."},
   *   {"role": "user", "content": "Who won the world series in 2020?"},
   *   {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
   *   {"role": "user", "content": "Where was it played?"}
   * ]
   */
  messages: Message[];
  /**
   * 温度，取值范围 0-2
   *
   * 用于控制生成文本的多样性。
   * 较高的温度会导致模型更加随机地选择下一个单词，从而生成更加多样化的文本。
   * 相反，较低的温度会使模型更倾向于选择概率最高的单词，因此生成的文本更加可预测。
   * 举例来说，当设置为 0 时，同样的输入每次都会生成完全同样的输出。
   *
   * 建议 temperature 和 top_p 只设置一个。
   *
   * @default 1
   */
  temperature?: number;
  /**
   * 高概率采样，取值范围 0-1
   *
   * 用于控制生成文本时考虑的词汇数量，从而使得生成的文本更加精细。
   * 在生成每个词时，模型会计算出所有可能的下一个词，并将概率按降序排列，然后通过 top_p 来决定哪些词可能被选中。
   * 举例来说，当设置成 0.1 时，只有概率为 top 10% 的词可能被选中。
   *
   * 建议 temperature 和 top_p 只设置一个。
   *
   * @default 1
   */
  top_p?: number;
  /**
   * 生成的选项数量
   *
   * @default 1
   */
  n?: number;
  /**
   * 是否使用流式响应
   *
   * @default false
   */
  stream?: boolean;
  /**
   * 结束语，最多设置四个，如果 ChatGPT 的回复中包含某个结束语，则停止生成
   */
  stop?: string | string[];
  /**
   * 最大 token 数量
   */
  max_tokens?: number;
  /**
   * 存在惩罚，取值范围 -2.0 到 2.0
   *
   * 用于惩罚模型生成那些已经出现在先前生成的文本中的 token（单词或标点符号等）。
   * 这可以确保生成的文本更加多样化，避免了模型在生成新文本时重复使用相同的 token。
   * presence_penalty 越高，模型生成的文本中就越不可能包含之前已经使用过的 token。
   *
   * @default 0;
   */
  presence_penalty?: number;
  /**
   * 频率惩罚，取值范围 -2.0 到 2.0
   *
   * 用于惩罚模型生成频率较高的 token，从而使得生成的文本更加多样化。
   * 与 presence_penalty 相似，frequency_penalty 越高，模型生成的文本中就越不可能包含频率较高的 token。
   */
  frequency_penalty?: number;
  /**
   * 逻辑偏差
   *
   * 用于控制模型生成特定 token 的概率，以满足特定的文本生成需求。
   * 通过设置不同的 logit_bias 值，可以让模型生成更符合预期的文本内容。
   * 例如，如果需要模型生成描述科技行业的文本，可以设置 logit_bias 为某些科技相关的词语，这样就能够促使模型更多地生成涉及科技领域的单词和内容。
   * 

   * @example
   * 假设我们使用 OpenAI 的文本生成 API 来生成一篇关于食品的描述性文章。
   * 如果我们希望文章中包含更多与甜点相关的单词和句子，可以使用 logit_bias 参数来调整模型生成特定单词的概率。
   * 例如，我们可以将 logit_bias 参数设置为以下内容：
   * "logit_bias": {
   *    "cupcake": 10,
   *    "cookie": 5,
   *    "cake": 8
   * }
   */
  logit_bias?: Record<string, number>;
  /**
   * 用户
   */
  user?: string;
}

export interface ChatResponse {
  id: string;
  model: Model;
  object: 'chat.completion';
  created: number;
  choices: {
    index: number;
    message: Message;
    finish_reason: null | 'stop';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatResponseChunk {
  id: string;
  model: Model;
  object: 'chat.completion.chunk';
  created: number;
  // https://github.com/openai/openai-cookbook/blob/main/examples/How_to_stream_completions.ipynb
  choices: {
    index: number;
    delta: { role: Role } | { content: string } | {};
    finish_reason: null | 'stop';
  }[];
}

export interface ChatResponseError {
  error?: {
    code: string;
    message: string;
    param: null;
    type: string;
  };
}

export function isMessage(message: Message | ChatResponse): message is Message {
  if ((message as Message).content) {
    return true;
  }
  return false;
}

export function getContent(message: Message | ChatResponse) {
  return isMessage(message) ? message.content : message.choices[0].message.content;
}

export function getRole(message: Message | ChatResponse) {
  return isMessage(message) ? message.role : message.choices[0].message.role;
}

export const fetchApiChat = async ({
  onMessage,
  ...chatRequest
}: {
  /**
   * 接受 stream 消息的回调函数
   */
  onMessage?: (content: string) => void;
} & Partial<ChatRequest>) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chatRequest),
  });

  if (!res.ok) {
    const error = new Error();
    Object.assign(error, await res.json());
    throw error;
  }

  if (res.ok) {
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const readResult = await reader?.read();
      const content = decoder.decode(readResult?.value);
      if (readResult?.done === false) {
        onMessage?.(content);
      }

      const done = !readResult || readResult.done;

      if (done) {
        break;
      }
    }
  }
};
