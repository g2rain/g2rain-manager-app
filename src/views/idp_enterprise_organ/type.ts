/**
 * 外部企业相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 外部企业接口
 */
export interface IdpEnterpriseOrgan extends BaseVo {
  idpType: string;
  enterpriseId: string;
  bindMode: string;
  organId: number;
  status: string;
  remark: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface IdpEnterpriseOrganPayload {
  id?: number; // 更新时传入 ID，新增时不传
  idpType?: string;
  enterpriseId?: string;
  bindMode?: string;
  organId?: number;
  status?: string;
  remark?: string;
}

/**
 * 外部企业查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface IdpEnterpriseOrganQuery extends BaseSelectListDto {
  // 业务查询字段
  idpType?: string;
  enterpriseId?: string;
  bindMode?: string;
  organId?: number;
  status?: string;
  remark?: string;
}

