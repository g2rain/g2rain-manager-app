/**
 * audit_event相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * audit_event接口
 */
export interface AuditEvent extends BaseVo {
  // 业务查询字段
  traceId: string;
  clientId: string;
  requestId: string;
  requestTime: string;
  acceptLanguage: string;
  path: string;
  method: string;
  userAgent: string;
  host: string;
  xForwardedFor: string;
  xRealIp: string;
  referer: string;
  sessionType: string;
  passportId: number;
  userId: number;
  name: string;
  adminUser: number;
  organId: number;
  organName: string;
  organType: string;
  adminCompany: number;
  targetOrganId: number;
  applicationId: number;
  applicationCode: string;
  applicationOrganId: number;
  payload: string;
}

/**
 * audit_event查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface AuditEventQuery extends BaseSelectListDto {
  traceId?: string;
  clientId?: string;
  requestId?: string;
  requestTime?: string;
  path?: string;
  method?: string;
  passportId?: number;
  userId?: number;
  name?: string;
  organId?: number;
  organName?: string;
  organType?: string;
  applicationId?: number;
  applicationCode?: string;
  applicationOrganId?: number;
}

