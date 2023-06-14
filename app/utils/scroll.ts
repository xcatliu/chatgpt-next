let isScrolling = false;
let isScriptScrolling = false;
let scrollTimeoutId: any = null;

export function initEventListenerScroll() {
  const scrollHandler = () => {
    // 如果是脚本滚动，则直接返回
    if (isScriptScrolling) {
      return;
    }

    isScrolling = true;
    clearTimeout(scrollTimeoutId);
    scrollTimeoutId = setTimeout(() => (isScrolling = false), 100);
  };

  window.addEventListener('scroll', scrollHandler);

  return () => window.removeEventListener('scroll', scrollHandler);
}

/**
 * 获取当前是否在滚动中
 */
export function getIsScrolling() {
  return isScrolling;
}

/**
 * 当前滚动位置距离最底端有多少
 */
export function gapToBottom() {
  return document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
}

export function scrollToBottom() {
  isScriptScrolling = true;
  window.scrollTo(0, document.body.scrollHeight);
  setTimeout(() => (isScriptScrolling = false), 0);
}
export function scrollToTop() {
  isScriptScrolling = true;
  window.scrollTo(0, 0);
  setTimeout(() => (isScriptScrolling = false), 0);
}

export function disableScroll() {
  window.document.body.style.overflow = 'hidden';
}
export function enableScroll() {
  window.document.body.style.overflow = 'visible';
}
