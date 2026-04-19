/**
 * passport相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * passport接口
 */
export interface Passport extends BaseVo {
  username: string;
  password: string;
  realName: string;
  sex: string;
  birthday: string;
  idNo: string;
  mobile: string;
  email: string;
  status: string;
  deleteFlag: boolean;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface PassportPayload {
  id?: number; // 更新时传入 ID，新增时不传
  username?: string;
  password?: string;
  realName?: string;
  sex?: string;
  birthday?: string;
  idNo?: string;
  mobile?: string;
  email?: string;
}

/**
 * passport查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface PassportQuery extends BaseSelectListDto {
  // 业务查询字段
  username?: string;
  realName?: string;
  mobile?: string;
  email?: string;
  status?: string;
}