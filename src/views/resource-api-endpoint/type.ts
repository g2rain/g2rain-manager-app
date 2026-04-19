/**
 * resource_api_endpoint相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * resource_api_endpoint接口
 */
export interface ResourceApiEndpoint extends BaseVo {
  applicationId: number;
  apiEndpointId: number;
  apiTag: string;
  apiName: string;
  requestMethod: string;
  apiUrl: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ResourceApiEndpointPayload {
  id?: number; // 更新时传入 ID，新增时不传
  applicationId?: number;
  apiEndpointId?: number;
}

/**
 * resource_api_endpoint查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ResourceApiEndpointQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationId?: number;
  apiEndpointId?: number;
  apiTag?: string;
  apiName?: string;
  requestMethod?: string;
  apiUrl?: string;
}