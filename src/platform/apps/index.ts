import { getEventAdapter } from './adapter';
import { peekMountedInstance } from './mounted-instances';
import { MicroAppMessageFactory, type RouteChangeData, type TokenInvalidData, type MicroAppMessageUnion } from '@/components/micro-app';

// 仅导出 MicroAppProps（事件相关类型全部在 components/micro-app 中）
export type { MicroAppProps } from './types';

// 导出适配器相关
export type { EventAdapter } from '@/components/micro-app';
export { QiankunSubAppEventAdapter, registerQiankunLifecycle, getQiankunSubAppEventAdapter } from './adapter.qiankun';
export { getEventAdapter, setEventAdapter, resetEventAdapter } from './adapter';
export { MicroAppMessageProcessorImpl } from '@/components/micro-app/message-processor';
export { TokenResponseDataHandler, initMicroAppMessageHandlers } from './message-handlers';

/**
 * 发送 Token 失效事件到主应用（带 instanceId/appKey，供新壳按实例定向刷新）
 * @param applicationCode 应用编码
 */
export function emitTokenInvalid(applicationCode: string): void {
  const data: TokenInvalidData & { applicationCode: string; source: 'sub-app' } = {
    applicationCode,
    source: 'sub-app',
  };
  const message = MicroAppMessageFactory.createTokenInvalid(data) as MicroAppMessageUnion & {
    instanceId?: string;
    appKey?: string;
    applicationCode?: string;
  };

  const id = peekMountedInstance();
  if (id) {
    message.instanceId = id;
    message.appKey = id;
    message.applicationCode = applicationCode;
  }

  const adapter = getEventAdapter();
  adapter.emitEvent(message as MicroAppMessageUnion);
}

/**
 * 发送路由变化事件到主应用
 * @param data 路由变化事件数据
 */
export function emitRouteChange(data: RouteChangeData): void {
  const message = MicroAppMessageFactory.createRouteChange(data);

  const adapter = getEventAdapter();
  adapter.emitEvent(message as MicroAppMessageUnion);
}

// 导出工具函数
export {
  isAloneMode,
  isIntegrateMode,
  isQiankunRuntime,
  isQianKunMode,
  shouldRedirectToMainShellGateway,
} from '@shared/utils/mode.util';

// 导出初始化函数
export { initTokenFromProps } from './init';

