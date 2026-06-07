/**
 * control_domain相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * control_domain接口
 */
export interface ControlDomain extends BaseVo {
  applicationId: number;
  applicationName: string;
  controlDomainName: string;
  controlDomainType: string;
  controlDomainScope: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ControlDomainPayload {
  id?: number; // 更新时传入 ID，新增时不传
  applicationId?: number;
  controlDomainName?: string;
  controlDomainType?: string;
  controlDomainScope?: string;
  description?: string;
}

/**
 * control_domain查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ControlDomainQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationId?: number;
  controlDomainName?: string;
  controlDomainType?: string;
  controlDomainScope?: string;
}