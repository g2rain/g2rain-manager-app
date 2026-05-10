/**
 * service_registry相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * service_registry接口
 */
export interface ServiceRegistry extends BaseVo {
  serviceCode: string;
  name: string;
  endpoint: string;
  routePrefix: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ServiceRegistryPayload {
  id?: number; // 更新时传入 ID，新增时不传
  serviceCode?: string;
  name?: string;
  endpoint?: string;
  routePrefix?: string;
  description?: string;
}

/**
 * service_registry查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ServiceRegistryQuery extends BaseSelectListDto {
  // 业务查询字段
  serviceCode?: string;
  name?: string;
  endpoint?: string;
  routePrefix?: string;
}

