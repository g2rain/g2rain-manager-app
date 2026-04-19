/**
 * api_endpoint相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * api_endpoint接口
 */
export interface ApiEndpoint extends BaseVo {
  apiName: string;
  apiUrl: string;
  requestMethod: string;
  apiTag: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ApiEndpointPayload {
  id?: number; // 更新时传入 ID，新增时不传
  apiName?: string;
  apiUrl?: string;
  requestMethod?: string;
  apiTag?: string;
  description?: string;
}

/**
 * api_endpoint查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ApiEndpointQuery extends BaseSelectListDto {
  // 业务查询字段
  apiName?: string;
  apiTag?: string;
}