/**
 * user相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * user接口
 */
export interface User extends BaseVo {
  passportId: number;
  organId: number;
  realName: string;
  email: string;
  mobile: string;
  admin: boolean;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface UserPayload {
  id?: number; // 更新时传入 ID，新增时不传
  passportId?: number;
  organId?: number;
  realName?: string;
  email?: string;
  mobile?: string;
}

/**
 * user查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface UserQuery extends BaseSelectListDto {
  // 业务查询字段
  passportId?: number;
  organId?: number;
  realName?: string;
  email?: string;
  mobile?: string;
}