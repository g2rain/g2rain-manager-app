/**
 * control_unit相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * control_unit接口
 */
export interface ControlUnit extends BaseVo {
  applicationId: number;
  controlUnitName: string;
  controlUnitScope: string;
  landing: boolean;
  status: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ControlUnitPayload {
  id?: number; // 更新时传入 ID，新增时不传
  applicationId?: number;
  controlUnitName?: string;
  controlUnitScope?: string;
  status?: string;
  description?: string;
}

/**
 * control_unit查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ControlUnitQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationId?: number;
  controlUnitName?: string;
  controlUnitScope?: string;
  status?: string;
  includeControlUnitScopes?: string[];
}