/**
 * 外部企业相关 API 服务
 * 提供外部企业数据的 CRUD 操作接口
 */

import { getHttpClient } from '@/components/http';
import type { IdpEnterpriseOrgan, IdpEnterpriseOrganPayload, IdpEnterpriseOrganQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 外部企业 API 服务类
 */
export class IdpEnterpriseOrganApi {
  /**
   * 获取外部企业列表
   * @param params 查询参数（可选）
   * @returns 外部企业列表
   */
  static async list(params?: IdpEnterpriseOrganQuery): Promise<IdpEnterpriseOrgan[]> {
    const http = getHttpClient('default');
    const res = await http.get<IdpEnterpriseOrgan[]>('/basis/idp_enterprise_organ/list', params);
    return res.data || [];
  }

  /**
   * 分页查询外部企业列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: IdpEnterpriseOrganQuery & PageSelectListDto): Promise<PageData<IdpEnterpriseOrgan>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<IdpEnterpriseOrgan>>('/basis/idp_enterprise_organ/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 外部企业 ID
   * @returns 外部企业详情
   */
  static async getById(id: number): Promise<IdpEnterpriseOrgan> {
    const http = getHttpClient('default');
    const res = await http.get<IdpEnterpriseOrgan>(`/basis/idp_enterprise_organ/${id}`);
    return res.data;
  }

  /**
   * 保存外部企业（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 外部企业数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的外部企业
   */
  static async save(payload: IdpEnterpriseOrganPayload): Promise<IdpEnterpriseOrgan> {
    const http = getHttpClient('default');
    const res = await http.post<IdpEnterpriseOrgan>('/basis/idp_enterprise_organ/save', payload);
    return res.data;
  }

  /**
   * 删除外部企业
   * @param id 外部企业 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/idp_enterprise_organ/${id}`);
  }
}

