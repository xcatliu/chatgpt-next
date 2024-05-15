export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
}

export enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  MethodNotAllowed = 405,
}

export const HttpHeaderJson = {
  'Content-Type': 'application/json',
};

/**
 * 全角空格，用于 html 中的占位符
 */
export const FULL_SPACE = '　';

/**
 * 使用 gpt-4-vision 时单次可传输的最多图片数量
 */
export const MAX_GPT_VISION_IMAGES = 9;

/**
 * 角色
 * 参考 https://github.com/openai/openai-node/blob/master/api.ts
 */
export enum Role {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

/**
 * ChatGPT 模型
 */
export enum Model {
  'gpt-3.5-turbo' = 'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k' = 'gpt-3.5-turbo-16k',
  'gpt-4o' = 'gpt-4o',
  'gpt-4-turbo' = 'gpt-4-turbo',
  'gpt-4' = 'gpt-4',
  'gpt-4-32k' = 'gpt-4-32k',
  'gpt-4-vision-preview' = 'gpt-4-vision-preview',
}

export const AllModels = [
  Model['gpt-3.5-turbo'],
  Model['gpt-3.5-turbo-16k'],
  Model['gpt-4o'],
  Model['gpt-4-turbo'],
  Model['gpt-4'],
  Model['gpt-4-32k'],
  Model['gpt-4-vision-preview'],
];

/** 支持发送图片的模型 */
export const VisionModels = [Model['gpt-4o'], Model['gpt-4-turbo'], Model['gpt-4-vision-preview']];

export const MIN_TOKENS: Record<Model, number> = {
  [Model['gpt-3.5-turbo']]: 1024,
  [Model['gpt-3.5-turbo-16k']]: 1024,
  [Model['gpt-4o']]: 1024,
  [Model['gpt-4-turbo']]: 1024,
  [Model['gpt-4']]: 1024,
  [Model['gpt-4-32k']]: 1024,
  [Model['gpt-4-vision-preview']]: 1024,
};

export const MAX_TOKENS: Record<Model, number> = {
  [Model['gpt-3.5-turbo']]: 4096,
  [Model['gpt-3.5-turbo-16k']]: 16384,
  [Model['gpt-4o']]: 128000,
  [Model['gpt-4-turbo']]: 128000,
  [Model['gpt-4']]: 8192,
  [Model['gpt-4-32k']]: 32768,
  [Model['gpt-4-vision-preview']]: 4096,
};

export enum MessageContentType {
  text = 'text',
  image_url = 'image_url',
}

export interface MessageContentItemText {
  type: MessageContentType.text;
  text: string;
}
export interface MessageContentItemImageUrl {
  type: MessageContentType.image_url;
  image_url: {
    url: string;
    width: number;
    height: number;
  };
}

/**
 * 结构化的 MessageContent
 */
export type StructuredMessageContentItem = MessageContentItemText | MessageContentItemImageUrl;

/**
 * 单条消息
 */
export interface Message {
  isError?: boolean;
  role: Role;
  content: string | StructuredMessageContentItem[];
}

/**
 * 简单文本消息
 * @TODO 实现 isSimpleStringMessage 方法
 */
export interface SimpleStringMessage {
  isError?: boolean;
  role: Role;
  content: string;
}

/**
 * /v1/chat/completions 的请求体
 * https://platform.openai.com/docs/api-reference/chat
 */
export interface ChatRequest {
  /**
   * 模型
   */
  model: Model;
  /**
   * 消息列表
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
   * tokens 限制
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
   *
   * @default 0;
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
   * 用户，OpenAI 用来监控和识别滥用的字段一般不需要传
   */
  user?: string;
}

/**
 * /v1/chat/completions 的响应体
 * https://platform.openai.com/docs/api-reference/chat
 */
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

/**
 * 传入 stream: true 之后 /v1/chat/completions 的流式响应
 * https://platform.openai.com/docs/api-reference/chat/create#chat/create-stream
 */
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

/**
 * /v1/chat/completions 的报错响应
 */
export interface ChatResponseError {
  error?: {
    code: string;
    message: string;
    param: null;
    type: string;
  };
}

/**
 * /v1/models 的响应体
 * https://platform.openai.com/docs/api-reference/models
 */
export interface ModelsResponse {
  data: {
    created: number;
    id: Model;
    object: 'model';
    owned_by: 'openai';
    parent: null;
    permission: {
      0: {
        allow_create_engine: boolean;
        allow_fine_tuning: boolean;
        allow_logprobs: boolean;
        allow_sampling: boolean;
        allow_search_indices: boolean;
        allow_view: boolean;
        created: number;
        group: null;
        id: string;
        is_blocking: boolean;
        object: 'model_permission';
        organization: '*';
      };
    };
    root: Model;
  }[];
  object: 'list';
}

/**
 * /v1/models 的响应体示例
 */
export const exampleModelsResponse: ModelsResponse = {
  data: [
    {
      created: 1677610602,
      id: Model['gpt-3.5-turbo'],
      object: 'model',
      owned_by: 'openai',
      parent: null,
      permission: {
        0: {
          allow_create_engine: false,
          allow_fine_tuning: false,
          allow_logprobs: true,
          allow_sampling: true,
          allow_search_indices: false,
          allow_view: true,
          created: 1684434433,
          group: null,
          id: 'modelperm-Gsp3SyIu7GamHB3McQv3rMf5',
          is_blocking: false,
          object: 'model_permission',
          organization: '*',
        },
      },
      root: Model['gpt-3.5-turbo'],
    },
  ],
  object: 'list',
};
