import MarkdownIt from 'markdown-it';

/** 多种 markdown-it 配置 */
const markdownItMap = {
  zero: new MarkdownIt('zero'),
  partial: new MarkdownIt('zero', {
    breaks: true,
    linkify: true,
  })
    .enable(['code', 'fence'])
    .enable(['autolink', 'backticks', 'image', 'link', 'newline']),
};

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

  // 由于多个换行符和空格在 markdown 中会被合并成一个，为了保留内容的格式，这里自行处理
  result = result.replace(/\n/g, '==BREAK=PLACEHOLDER==');
  // 遇到连续的 2个或 2个以上空格时，先替换，但保留第一个空格
  // result = result.replace(/ {2,}/g, (match) => ' ' + '==SPACE=PLACEHOLDER=='.repeat(match.length - 1));
  // 遇到连续的 2个或 2个以上空格时，替换成 nbsp
  result = result.replace(/ {2,}/g, (match) => '==SPACE=PLACEHOLDER=='.repeat(match.length));
  result = markdownItMap[mode].render(result).trim();
  result = result.replace(/==SPACE=PLACEHOLDER==/g, '&nbsp;');
  result = result.replace(/==BREAK=PLACEHOLDER==/g, '<br>');

  return result;
}
