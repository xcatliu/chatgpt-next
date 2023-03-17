export function isMobile() {
  return document.body.offsetWidth < 769;
}

/**
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
