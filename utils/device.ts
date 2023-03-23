/** 通过宽度判断是否为移动端 */
export function isMobile() {
  // 768 + 768*(1-0.618) + 16*4 + 1 = 1126
  // 对话框 + 菜单栏 + 间隔 + 1px区分
  return document.body.offsetWidth < 1126;
}

/**
 * 通过 ua 判断是否为微信，支持传入 ua，这样就可以在 ssr 时运行
 * https://gist.github.com/GiaoGiaoCat/fff34c063cf0cf227d65
 */
export function isWeChat(userAgent?: string) {
  if (userAgent) {
    return /micromessenger/.test(userAgent.toLowerCase());
  }
  if (typeof window !== 'undefined') {
    return /micromessenger/.test(window.navigator.userAgent.toLowerCase());
  }
  return false;
}
