export const exampleChatMessage = {
  role: 'assistant',
  id: 'chatcmpl-6tzammlWjBIEuycFxbQG3dAn2YedD',
  parentMessageId: '6ad5cb37-7bdc-46bf-9e3a-89859ce258a9',
  text: '武汉有很多著名的小吃，其中包括：\n\n1. 热干面：一种以面条为主要原料，加入芝麻酱、辣椒油等调味料的特色汉族面食。\n2. 武昌鱼：一种以蒸或煮的方式制作，配以豆瓣酱、葱姜蒜等调料的江鲜菜肴。\n3. 豆皮：一种由黄豆浆制成的薄片状食品，可用于烧烤或炒菜。\n4. 烤鱼：一种将整条鱼放在炭火上烤制，再用各种调味料加工而成的湖北特色美食。\n5. 荆门米粉：一种以米粉为主料，加上牛肉、黄鱼肉、豆皮等配料，以及特制的辣椒酱、糖醋汁等作为佐料的地方特色汉族小吃。',
  detail: {
    id: 'chatcmpl-6tzammlWjBIEuycFxbQG3dAn2YedD',
    object: 'chat.completion',
    created: 1678802820,
    model: 'gpt-3.5-turbo-0301',
    usage: {
      prompt_tokens: 69,
      completion_tokens: 314,
      total_tokens: 383,
    },
    choices: [
      {
        message: {
          role: 'assistant',
          content:
            '武汉有很多著名的小吃，其中包括：\n\n1. 热干面：一种以面条为主要原料，加入芝麻酱、辣椒油等调味料的特色汉族面食。\n2. 武昌鱼：一种以蒸或煮的方式制作，配以豆瓣酱、葱姜蒜等调料的江鲜菜肴。\n3. 豆皮：一种由黄豆浆制成的薄片状食品，可用于烧烤或炒菜。\n4. 烤鱼：一种将整条鱼放在炭火上烤制，再用各种调味料加工而成的湖北特色美食。\n5. 荆门米粉：一种以米粉为主料，加上牛肉、黄鱼肉、豆皮等配料，以及特制的辣椒酱、糖醋汁等作为佐料的地方特色汉族小吃。',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  },
} as const;

export const userMessage = {
  text: '武汉有什么小吃？',
} as const;

export const htmlMessage = {
  role: 'assistant',
  id: 'chatcmpl-6vKhhgivgv6KKhGpaQJcslBwYOCKL',
  parentMessageId: '1c61f9ab-6e96-471b-9206-51fc96e1498b',
  text: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Hello World</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>',
  detail: {
    id: 'chatcmpl-6vKhhgivgv6KKhGpaQJcslBwYOCKL',
    object: 'chat.completion',
    created: 1679122301,
    model: 'gpt-3.5-turbo-0301',
    usage: { prompt_tokens: 68, completion_tokens: 44, total_tokens: 112 },
    choices: [
      {
        message: {
          role: 'assistant',
          content:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Hello World</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  },
} as const;

export const regexpNumberMessage = {
  role: 'assistant',
  id: 'chatcmpl-6vQar6RpQWHRIljk7UUSBYUgG3UQ0',
  parentMessageId: '10cb5ffc-1fef-41d8-8786-ab7b95e9fd63',
  text: '以下是一个匹配美国电话号码格式的正则表达式：\n```\n^\\(?([0-9]{3})\\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$\n```\n\n解释如下：\n- `^` 表示字符串的开头。\n- `\\(` 表示左括号，需要使用反斜杠进行转义。\n- `?` 表示前面的字符或者括号可能存在，也可能不存在。\n- `([0-9]{3})` 表示匹配3个数字。\n- `\\)?)` 匹配右括号或空格，需要使用反斜杠进行转义。\n- `[-.●]?` 表示匹配横线、点或圆点，可能存在，也可能不存在。\n- `([0-9]{3})` 再次匹配3个数字。\n- `[-.●]?` 再次可能存在，也可能不存在。\n- `([0-9]{4})$` 最后匹配4个数字，并以字符串末尾结尾。\n\n这个正则表达式可以匹配如下格式的美国电话号码：\n\n- (123)456-7890\n- (123) 456-7890\n- 123-456-7890\n- 123.456.7890\n- 1234567890',
  detail: {
    id: 'chatcmpl-6vQar6RpQWHRIljk7UUSBYUgG3UQ0',
    object: 'chat.completion',
    created: 1679144941,
    model: 'gpt-3.5-turbo-0301',
    usage: { prompt_tokens: 66, completion_tokens: 329, total_tokens: 395 },
    choices: [
      {
        message: {
          role: 'assistant',
          content:
            '以下是一个匹配美国电话号码格式的正则表达式：\n```\n^\\(?([0-9]{3})\\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$\n```\n\n解释如下：\n- `^` 表示字符串的开头。\n- `\\(` 表示左括号，需要使用反斜杠进行转义。\n- `?` 表示前面的字符或者括号可能存在，也可能不存在。\n- `([0-9]{3})` 表示匹配3个数字。\n- `\\)?)` 匹配右括号或空格，需要使用反斜杠进行转义。\n- `[-.●]?` 表示匹配横线、点或圆点，可能存在，也可能不存在。\n- `([0-9]{3})` 再次匹配3个数字。\n- `[-.●]?` 再次可能存在，也可能不存在。\n- `([0-9]{4})$` 最后匹配4个数字，并以字符串末尾结尾。\n\n这个正则表达式可以匹配如下格式的美国电话号码：\n\n- (123)456-7890\n- (123) 456-7890\n- 123-456-7890\n- 123.456.7890\n- 1234567890',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  },
} as const;
