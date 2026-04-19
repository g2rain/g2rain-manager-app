/**
 * role_control_unit_relation相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * role_control_unit_relation接口
 */
export interface RoleControlUnitRelation extends BaseVo {
  roleId: number;
  controlUnitId: number;
  controlUnitName: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface RoleControlUnitRelationPayload {
  roleId?: number;
  controlUnitIds?: number[];
  deleteControlUnitIds?: number[];
}

/**
 * role_control_unit_relation查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface RoleControlUnitRelationQuery extends BaseSelectListDto {
  // 业务查询字段
  roleId?: number;
}