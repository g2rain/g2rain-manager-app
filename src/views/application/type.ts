/**
 * application相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * application接口
 */
export interface Application extends BaseVo {
  organId: number;
  applicationName: string;
  applicationCode: string;
  canIntegrate: boolean;
  landing: boolean;
  applicationType: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  endpointUrl: string;
  contextPath: string;
  status: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ApplicationPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  applicationType?: string;
  applicationName?: string;
  applicationCode?: string;
  canIntegrate?: boolean;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
  endpointUrl?: string;
  contextPath?: string;
  description?: string;
}

/**
 * 应用ID和Name映射, 用于字典
 */
export interface ApplicationIdNameMap {
  id: number;
  applicationName: string;
}

/**
 * application查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ApplicationQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  canIntegrate?: boolean;
  applicationType?: string;
  includeApplicationTypes?: string[];
  applicationName?: string;
  applicationCode?: string;
}