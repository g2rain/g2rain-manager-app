/**
 * application_authorization相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * application_authorization接口
 */
export interface ApplicationAuthorization extends BaseVo {
  organId: number;
  applicationId: number;
  controlDomainId: number;
  controlDomainName: string;
  controlDomainDesc: string;
  subscriptionId: number;
  status: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ApplicationAuthorizationPayload {
  organId?: number;
  applicationId?: number;
  controlDomainId?: number;
}

/**
 * application_authorization查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ApplicationAuthorizationQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  applicationId?: number;
  subscriptionId?: number;
  status?: string;
}