import MarkdownIt from 'markdown-it';
// @ts-ignore
import katex from 'markdown-it-katex';

import { sleep } from './sleep';

/** 多种 markdown-it 配置 */
const markdownItMap = {
  zero: new MarkdownIt('zero'),
  partial: new MarkdownIt('zero', {
    breaks: true,
    linkify: true,
    // 使用 Prism 解析代码
    highlight: (str: string, l) => {
      let lang = l ?? 'plain';
      if (typeof (window as any).Prism.languages[lang] === 'undefined') {
        lang = 'plain';
      }
      const grammar = (window as any).Prism.languages[lang];
      // https://github.com/PrismJS/prism/issues/1171#issuecomment-631470253
      (window as any).Prism.hooks.run('before-highlight', { grammar });
      return `<pre class="language-${lang}"><div class="prism-title">${l}<a class="prism-copy">拷贝代码</a></div><code class="language-${lang}">${(
        window as any
      ).Prism.highlight(str, grammar, lang)}</code></pre>`;
    },
  })
    .enable(['code', 'fence'])
    .enable(['autolink', 'backticks', 'image', 'link', 'newline'])
    .use(katex),
};

// 实现「拷贝代码」功能
if (typeof window !== 'undefined') {
  window.document.addEventListener('click', (e) => {
    // @ts-ignore
    if (e.target?.classList?.contains('prism-copy')) {
      // @ts-ignore
      const text: string = e.target.parentNode?.nextSibling?.innerText;
      navigator.clipboard
        .writeText(text)
        .then(async () => {
          // @ts-ignore
          e.target.innerHTML = '<span style="margin-right:3px">拷贝成功</span>✅';
          await sleep(1000);
          // @ts-ignore
          e.target.innerText = '拷贝代码';
        })
        .catch((err) => {
          alert(`拷贝代码时出错：${err.message}`);
        });
    }
  });
}

export enum FormatMessageMode {
  /** 只处理换行符、空格、html 转义 */
  zero = 'zero',
  /** 只处理一部分 md 语法，如 link、image、code 等 */
  partial = 'partial',
  /** 完整的 markdown 处理 */
  // full = 'full',
}

/**
 * 格式化消息
 */
export function formatMessage(message?: string, mode = FormatMessageMode.zero) {
  let result = message?.trim();

  if (!result) {
    return '';
  }

  // 仅在 zero 模式下保留换行和空格
  if (mode === FormatMessageMode.zero) {
    // 由于多个换行符和空格在 markdown 中会被合并成一个，为了保留内容的格式，这里自行处理
    result = result.replace(/\n/g, '==BREAK=PLACEHOLDER==');
    // 遇到连续的 2个或 2个以上空格时，先替换，但保留第一个空格
    // result = result.replace(/ {2,}/g, (match) => ' ' + '==SPACE=PLACEHOLDER=='.repeat(match.length - 1));
    // 遇到连续的 2个或 2个以上空格时，替换成 nbsp
    result = result.replace(/ {2,}/g, (match) => '==SPACE=PLACEHOLDER=='.repeat(match.length));
  }

  result = markdownItMap[mode].render(result).trim();
  if (mode === FormatMessageMode.zero) {
    result = result.replace(/==SPACE=PLACEHOLDER==/g, '&nbsp;');
    result = result.replace(/==BREAK=PLACEHOLDER==/g, '<br>');
  }

  return result;
}
