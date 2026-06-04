import zhCn from 'element-plus/es/locale/lang/zh-cn';
import zhTw from 'element-plus/es/locale/lang/zh-tw';
import en from 'element-plus/es/locale/lang/en';
import ja from 'element-plus/es/locale/lang/ja';
import type { Language } from 'element-plus/es/locale';

function resolveFromCode(localeCode: string): Language {
  const [lang, region = ''] = localeCode.trim().toLowerCase().split('-');

  if (lang === 'zh') {
    if (['tw', 'hk', 'mo'].includes(region)) {
      return zhTw;
    }
    return zhCn;
  }

  if (lang === 'en') {
    return en;
  }

  if (lang === 'ja') {
    return ja;
  }

  return zhCn;
}

/** 将用户 locale 或浏览器语言映射为 Element Plus 语言包 */
export function resolveElementPlusLocale(localeCode?: string | null): Language {
  const code = localeCode?.trim();
  if (code) {
    return resolveFromCode(code);
  }

  const browserLang =
    navigator.language ||
    navigator.languages?.[0] ||
    'zh-CN';

  return resolveFromCode(browserLang);
}
