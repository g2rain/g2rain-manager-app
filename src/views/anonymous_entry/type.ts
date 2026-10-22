/**
 * 匿名接入码相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/** 接入码状态 */
export type EntryStatus = 'ACTIVE' | 'INACTIVE';

/**
 * 匿名接入码
 */
export interface AnonymousEntry extends BaseVo {
  organId: number;
  applicationId: number;
  entryName: string;
  /** 服务端生成：ek_ 前缀 + base62 随机串，区分大小写 */
  entryKey: string;
  status: EntryStatus;
}

/**
 * 新增 / 更新负载：接入码与状态由服务端维护；更新时只允许改名称，启停走状态接口
 */
export interface AnonymousEntryPayload {
  id?: number;
  organId?: number;
  applicationId?: number;
  entryName: string;
}

/**
 * 匿名接入码查询条件
 */
export interface AnonymousEntryQuery extends BaseSelectListDto {
  organId?: number;
  applicationId?: number;
  status?: EntryStatus;
}
