/**
 * login_token相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * login_token接口
 */
export interface LoginToken extends BaseVo {
  sessionType: string;
  organId: number;
  organType: string;
  adminCompany: number;
  passportId: number;
  userId: number;
  realName: string;
  adminUser: number;
  applicationId: number;
  applicationOrganId: number;
  clientId: string;
}

/**
 * login_token查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface LoginTokenQuery extends BaseSelectListDto {
  // 业务查询字段
  sessionType?: string;
  organId?: number;
  organType?: string;
  adminCompany?: number;
  passportId?: number;
  userId?: number;
  realName?: string;
  adminUser?: number;
  applicationId?: number;
  applicationOrganId?: number;
  clientId?: string;
}

