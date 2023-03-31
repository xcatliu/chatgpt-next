import { headers } from 'next/headers';

/**
 * 通过 ua 判断是否为微信
 * https://gist.github.com/GiaoGiaoCat/fff34c063cf0cf227d65
 */
export function isWeChat() {
  const userAgent = headers().get('user-agent');

  if (userAgent) {
    return /micromessenger/.test(userAgent.toLowerCase());
  }
  if (typeof window !== 'undefined') {
    return /micromessenger/.test(window.navigator.userAgent.toLowerCase());
  }
  return false;
}
