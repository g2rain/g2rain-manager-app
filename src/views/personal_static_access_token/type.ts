/**
 * 个人静态访问令牌相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 个人静态访问令牌接口
 */
export interface PersonalStaticAccessToken extends BaseVo {
  applicationAuthorizationId: number;
  applicationId: number;
  applicationName: string;
  organId: number;
  organName: string;
  userId: number;
  userName: string;
  name: string;
  tokenHash: string;
  maskedToken: string;
  status: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface PersonalStaticAccessTokenPayload {
  id?: number; // 更新时传入 ID，新增时不传
  applicationAuthorizationId?: number;
  name?: string;
  tokenHash?: string;
  maskedToken?: string;
}

/**
 * 个人静态访问令牌查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface PersonalStaticAccessTokenQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationAuthorizationId?: number;
  name?: string;
  status?: string;
}
