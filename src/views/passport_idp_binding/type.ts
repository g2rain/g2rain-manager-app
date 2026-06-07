/**
 * 账号与外部身份源绑定表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 账号与外部身份源绑定表接口
 */
export interface PassportIdpBinding extends BaseVo {
  passportId: number;
  idpType: string;
  idpSubject: string;
  corpId: string;
  idpUserId: string;
  idpApplicationCode: string;
  bindMode: string;
  rawProfile: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface PassportIdpBindingPayload {
  id?: number; // 更新时传入 ID，新增时不传
  passportId?: number;
  idpType?: string;
  idpSubject?: string;
  corpId?: string;
  idpUserId?: string;
  idpApplicationCode?: string;
  bindMode?: string;
  rawProfile?: string;
}

/**
 * 账号与外部身份源绑定表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface PassportIdpBindingQuery extends BaseSelectListDto {
  // 业务查询字段
  passportId?: number;
  idpType?: string;
  idpSubject?: string;
  corpId?: string;
  idpUserId?: string;
  idpApplicationCode?: string;
  bindMode?: string;
  rawProfile?: string;
}

