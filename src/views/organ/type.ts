/**
 * organ相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * organ接口
 */
export interface Organ extends BaseVo {
  organType: string;
  organName: string;
  status: string;
}

/**
 * organ接口
 */
export interface OrganIdNameMap {
  organId: number;
  organName: string;
}

/**
 * organ接口
 */
export interface OrganHierarchicalRelation {
  organId: number;
  organName: string;
  subOrgans: OrganHierarchicalRelation[];
}

export interface OrganClosure {
  sourceAncestorId?: number;
  targetAncestorId?: number;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface OrganPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organType?: string;
  organName?: string;
}

/**
 * organ查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface OrganQuery extends BaseSelectListDto {
  // 业务查询字段
  organType?: string;
  organName?: string;
  status?: string;
}