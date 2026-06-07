/**
 * audit_event相关 API 服务
 * 提供audit_event数据的 CRUD 操作接口
 */

import { getHttpClient } from '@/components/http';
import type { AuditEvent, AuditEventQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * audit_event API 服务类
 */
export class AuditEventApi {
  /**
   * 获取audit_event列表
   * @param params 查询参数（可选）
   * @returns audit_event列表
   */
  static async list(params?: AuditEventQuery): Promise<AuditEvent[]> {
    const http = getHttpClient('default');
    const res = await http.get<AuditEvent[]>('/basis/audit_event/list', params);
    return res.data || [];
  }

  /**
   * 分页查询audit_event列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: AuditEventQuery & PageSelectListDto): Promise<PageData<AuditEvent>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<AuditEvent>>('/basis/audit_event/page', params);
    return res.data;
  }
}

