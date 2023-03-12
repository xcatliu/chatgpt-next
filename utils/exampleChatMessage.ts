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

export const exampleChatMessage2 = {
  text: '武汉有什么小吃？',
} as const;
