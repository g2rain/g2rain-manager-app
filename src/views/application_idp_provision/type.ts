/**
 * 外部身份源应用与平台应用的绑定相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 外部身份源应用与平台应用的绑定接口
 */
export interface ApplicationIdpProvision extends BaseVo {
  applicationId: number;
  idpType: string;
  idpApplicationCode: string;
  remark: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ApplicationIdpProvisionPayload {
  id?: number; // 更新时传入 ID，新增时不传
  applicationId?: number;
  idpType?: string;
  idpApplicationCode?: string;
  remark?: string;
}

/**
 * 外部身份源应用与平台应用的绑定查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ApplicationIdpProvisionQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationId?: number;
  idpType?: string;
  idpApplicationCode?: string;
  remark?: string;
}

