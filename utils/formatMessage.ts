import MarkdownIt from 'markdown-it';
const partialMarkdownIt = new MarkdownIt('zero', {
  breaks: true,
  linkify: true,
})
  .enable(['code', 'fence'])
  .enable(['autolink', 'backticks', 'image', 'link', 'newline']);

export enum formatMessageMode {
  /** 只处理换行符，将 \n 替换为 <br> */
  br = 'br',
  /** 只处理一部分 md 语法，如 link、image、code 等 */
  partial = 'partial',
  /** 完整的 markdown 处理 */
  // md = 'md',
}

export function formatMessage(message?: string, mode?: formatMessageMode) {
  let result = message?.trim();

  if (!result) {
    return '';
  }

  // 只处理换行符，将 \n 替换为 <br>
  if (mode === formatMessageMode.br) {
    return result.replace(/\n/g, '<br />') ?? '';
  }

  /**
   * 由于空格解析在 md.render 过程中的一些 bug
   * 这里先把超过2个的空格转换成 __SPACE_PLACEHOLDER__
   * 等 md.render 解析好之后，再转换成 &nbsp;
   */
  result = result.replace(/ {2,}/g, (match) => '==SPACE=PLACEHOLDER=='.repeat(match.length));
  result = partialMarkdownIt.render(result).trim();
  result = result.replace(/==SPACE=PLACEHOLDER==/g, '&nbsp;');

  return result;
}
