/**
 * 匿名接入码 API
 */

import { getHttpClient } from '@runtime/http';
import type { AnonymousEntry, AnonymousEntryPayload, AnonymousEntryQuery, EntryStatus } from './type';

export class AnonymousEntryApi {
  /**
   * 查询某组机构 + 应用下的接入码
   */
  static async list(params: AnonymousEntryQuery): Promise<AnonymousEntry[]> {
    const http = getHttpClient('default');
    const res = await http.get<AnonymousEntry[]>('/basis/anonymous_entry/list', params);
    return res.data || [];
  }

  /**
   * 新增或更新：新增时服务端生成接入码、状态固定为有效；更新时只改名称
   * @returns 主键 ID
   */
  static async save(payload: AnonymousEntryPayload): Promise<number> {
    const http = getHttpClient('default');
    const res = await http.post<number>('/basis/anonymous_entry/save', payload);
    return res.data;
  }

  /**
   * 启用 / 停用接入码；停用后该入口的在线访客立即失效
   */
  static async updateStatus(id: number, status: EntryStatus): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`/basis/anonymous_entry/${id}/status`, { status });
  }

  /**
   * 删除接入码
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/anonymous_entry/${id}`);
  }
}
