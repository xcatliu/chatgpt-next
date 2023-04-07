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
