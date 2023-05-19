import { useEffect } from 'react';

export const useDarkMode = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // 暗色模式
      link.href = '/prism-dark.css';
    } else {
      // 浅色模式
      link.href = '/prism-light.css';
    }
    document.head.appendChild(link);

    let darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      if (e.matches) {
        // 暗色模式
        link.href = '/prism-dark.css';
      } else {
        // 浅色模式
        link.href = '/prism-light.css';
      }
    });
  }, []);
};
