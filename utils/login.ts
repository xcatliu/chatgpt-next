import { getCookie, removeCookies, setCookie } from 'cookies-next';

import { sleep } from './sleep';

/** 是否登录 */
export function isLogin() {
  return getCookie('OPENAI_API_KEY');
}

/** 开始登录 */
export function login() {
  // 如果已登录，则提前结束
  if (isLogin()) {
    return true;
  }

  return new Promise<boolean>(async (resolve) => {
    // 如果未登录，则弹窗让用户输入 OPENAI_API_KEY
    const OPENAI_API_KEY = window.prompt('OPENAI_API_KEY:');
    // 由于 prompt 时序问题，需要 sleep
    await sleep(16);

    // 如果用户输入了 key，则设置 cookie，登录成功
    if (OPENAI_API_KEY) {
      setCookie('OPENAI_API_KEY', OPENAI_API_KEY);
      return resolve(true);
    }

    // 如果没有输入 key，则登录失败
    return resolve(false);
  });
}

/** 登出 */
export function logout() {
  // 如果未登录，则提前结束
  if (!isLogin()) {
    return true;
  }

  return new Promise<boolean>(async (resolve) => {
    // 如果已登录，则弹窗提示用户是否登出
    const logoutConfirmed = window.confirm(
      `当前 OPENAI_API_KEY 是 ****${(getCookie('OPENAI_API_KEY') as string).slice(-4)}\n是否要登出以重新输入？`,
    );
    // 由于 prompt 时序问题，需要 sleep
    await sleep(16);

    // 如果确认要登出，则删除 cookie，登出成功
    if (logoutConfirmed) {
      removeCookies('OPENAI_API_KEY');
      return resolve(true);
    }

    // 如果取消登出，则登出失败
    return resolve(false);
  });
}
