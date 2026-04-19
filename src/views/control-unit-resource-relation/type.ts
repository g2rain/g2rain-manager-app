/**
 * control_unit_resource_relation相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * control_unit_resource_relation接口
 */
export interface ControlUnitResourceRelation extends BaseVo {
  controlUnitId: number;
  resourceId: number;
  resourceType: string;
  status: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ControlUnitResourceRelationPayload {
  controlUnitId?: number;
  createRelations?: ResourcesPayload[];
  updateRelations?: ResourcesPayload[];
  deleteRelations?: ResourcesPayload[];
}

export interface ResourcesPayload {
  resourceId?: number;
  resourceType?: string;
  status?: string;
}

/**
 * control_unit_resource_relation查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ControlUnitResourceRelationQuery extends BaseSelectListDto {
  // 业务查询字段
  controlUnitId?: number;
  resourceId?: number;
  resourceType?: string;
  status?: string;
}