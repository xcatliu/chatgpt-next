import { getCookie, removeCookies, setCookie } from 'cookies-next';

import { removeCache, setCache } from '@/utils/cache';

import { sleep } from './sleep';

/** 开始登录 */
export function login() {
  // 如果已登录，则提前结束
  if (getCookie('apiKey')) {
    return true;
  }

  return new Promise<boolean>(async (resolve) => {
    // 如果未登录，则弹窗让用户输入密钥
    const apiKey = window.prompt('请输入密钥');
    // 由于 prompt 时序问题，需要 sleep
    await sleep(16);

    // 如果用户输入了密钥，则设置 cookie，登录成功
    if (apiKey) {
      // 同时存储在 cookie 和 localStorage 中，防止微信中容易丢失 cookie
      setCookie('apiKey', apiKey);
      setCache('apiKey', apiKey);
      // @ts-ignore 第二个参数 ts 不支持传 null，但其实是可以传的，表示不修改标题
      history.replaceState(null, null, '/');
      return resolve(true);
    }

    // 如果没有输入 key，则登录失败
    return resolve(false);
  });
}

/** 登出 */
export function logout() {
  // 如果未登录，则提前结束
  if (!getCookie('apiKey')) {
    return true;
  }

  return new Promise<boolean>(async (resolve) => {
    // 如果已登录，则弹窗提示用户是否登出
    const logoutConfirmed = window.confirm(
      `当前密钥是 ****${(getCookie('apiKey') as string).slice(-4)}\n是否要登出以重新输入？`,
    );
    // 由于 prompt 时序问题，需要 sleep
    await sleep(16);

    // 如果确认要登出，则删除 cookie，登出成功
    if (logoutConfirmed) {
      removeCookies('apiKey');
      removeCache('apiKey');
      // @ts-ignore 第二个参数 ts 不支持传 null，但其实是可以传的，表示不修改标题
      history.replaceState(null, null, '/');
      return resolve(true);
    }

    // 如果取消登出，则登出失败
    return resolve(false);
  });
}
