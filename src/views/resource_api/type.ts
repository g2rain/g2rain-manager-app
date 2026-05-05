/**
 * resource_api相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * resource_api接口
 */
export interface ResourceApi extends BaseVo {
  serviceCode: string;
  serviceName: string;
  apiTags: string;
  name: string;
  method: string;
  path: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ResourceApiPayload {
  id?: number; // 更新时传入 ID，新增时不传
  serviceCode?: string;
  apiTags?: string;
  name?: string;
  method?: string;
  path?: string;
  description?: string;
}

/**
 * 批量导入时单条接口 DTO
 */
export interface UploadApiDto {
  apiTags: string;
  name: string;
  method: string;
  path: string;
  description?: string;
}

/**
 * 批量导入 DTO
 */
export interface UploadResourceApiDto {
  apis: UploadApiDto[];
}

/**
 * resource_api查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ResourceApiQuery extends BaseSelectListDto {
  // 业务查询字段
  serviceCode?: string;
  apiTags?: string;
  name?: string;
  method?: string;
  path?: string;
}

