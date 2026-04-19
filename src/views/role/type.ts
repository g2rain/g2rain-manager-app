/**
 * role相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * role接口
 */
export interface Role extends BaseVo {
  organId: number;
  roleType: string;
  roleName: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface RolePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  roleName?: string;
}

/**
 * role查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface RoleQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  roleType?: string;
  roleName?: string;
}