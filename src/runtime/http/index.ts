/**
 * Runtime 层 HTTP 初始化入口
 *
 * - 负责为 HttpClient 注入认证会话上下文（HttpAuthSession）
 * - 负责注入统一的认证异常处理逻辑（未登录 / 刷新失败时跳转 SSO）
 */

import { loadingManager } from '@/components/loading';
import { sso } from '@runtime/auth';
import { updateHttpClientOptions, type HttpAuthSession, type HttpClientOptions, type Client } from '@/components/http';
import { ElMessage } from 'element-plus';
import { useAccessTokenStore } from '@platform/stores';
import type { AppError } from '@/components/error';
import { markNotified } from './notified';
import { isQiankunRuntime } from '@shared/utils/mode.util';

/**
 * 将 platform 层的 token.store 适配为 HttpAuthSession
 */
function createHttpAuthSession(): HttpAuthSession {
  const store = useAccessTokenStore();

  return {
    client: store.client as Client | null,
    isLogin: store.isLogin,
    isAccessTokenValid: store.isAccessTokenValid,
    tokenExpired: store.tokenExpired,
    tokenString: store.tokenString,
    setTokenExpired: store.setTokenExpired,
  };
}

/**
 * 默认的认证异常处理：
 * - 统一处理 NO_LOGIN / TOKEN_REFRESH_FAILED 等认证相关错误
 * - 当前实现：关闭 loading 并跳转到 SSO
 */
async function defaultAuthErrorHandler(reason: 'NO_LOGIN' | 'TOKEN_REFRESH_FAILED', error: unknown): Promise<void> {
  console.warn('[Runtime HTTP] Auth error:', reason, error);

  // 确保关闭 loading
  loadingManager.hide();

  // 嵌入主壳时登录态归主壳管理，不把整个页面带去子应用自己的 SSO
  if (isQiankunRuntime()) return;

  try {
    await sso.redirectToSSO();
  } catch (redirectError) {
    console.error('[Runtime HTTP] redirectToSSO failed:', redirectError);
  }
}

/**
 * 请求失败的统一提示：显示后端返回的 errorMessage。
 * 登录态错误由 defaultAuthErrorHandler 处理，不重复提示。
 */
function notifyHttpError(error: unknown): void {
  const { errorCode, message } = error as AppError;
  if (errorCode === 'gateway.40001' || errorCode === 'gateway.40002') return;
  markNotified(error);
  ElMessage.error(message);
}

/**
 * 初始化 HTTP 组件：
 * - 为 default HttpClient 注入 HttpAuthSession 提供者
 * - 为 default HttpClient 注入统一的认证异常处理器
 *
 * 建议在应用启动时尽早调用（如平台 boot 中）
 */
export function initHttp(): void {
  const authSessionProvider = (): HttpAuthSession => createHttpAuthSession();

  const defaultOptions: Partial<HttpClientOptions> = {
    authSessionProvider,
    authErrorHandler: defaultAuthErrorHandler,
    ensureAccessToken: (opts) => sso.ensureAccessToken(opts),
    onError: notifyHttpError,
  };

  // 为 default 客户端「增量」注入认证相关配置（保持 components/http 中的默认 baseURL 等配置不变）
  updateHttpClientOptions('default', defaultOptions);
}

