const checkThemeIndicators = (root, body, theme) => {
  const indicators = [
    root.classList.contains(theme),
    root.dataset.theme === theme,
    root.dataset.colorMode === theme,
    body?.classList.contains(theme),
    body?.dataset.theme === theme,
  ];

  return indicators.some(Boolean);
};

// 检查页面是否处于暗色模式
// 优先级：页面 > 系统
export const detectDarkMode = () => {
  const isSystemDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;
  const html = document.documentElement;

  // 1. 检查 color-scheme
  const cs = getComputedStyle(html).colorScheme;
  if (cs.includes('dark') && !cs.includes('light')) return true;
  if (cs.includes('light') && !cs.includes('dark')) return false;

  // 2. 检查常见亮色、暗色模式标志
  const body = document.body;
  const darkIndicatorsRes = checkThemeIndicators(html, body, 'dark');
  const lightIndicatorsRes = checkThemeIndicators(html, body, 'light');
  if (darkIndicatorsRes && !lightIndicatorsRes) return true;
  if (!darkIndicatorsRes && lightIndicatorsRes) return false;

  // 3. 系统保底
  return isSystemDark;
};

let mediaQueryListened = false;
let themeObserver = null;

const callbacks = [];
const mainCallback = () => {
  callbacks.forEach((callback) => callback());
};

export const initThemeObserver = (callback) => {
  callbacks.push(callback);
  callback();

  // 监听系统主题变化
  if (!mediaQueryListened) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', mainCallback);
    mediaQueryListened = true;
  }

  // 监听宿主页面 class/attribute 变化
  if (!themeObserver) {
    themeObserver = new MutationObserver(mainCallback);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-color-mode'],
    });

    if (document.body) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-color-mode'],
      });
    }
  }
};
