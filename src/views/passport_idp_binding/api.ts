/**
 * 账号与外部身份源绑定表相关 API 服务
 * 提供账号与外部身份源绑定表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@/components/http';
import type { PassportIdpBinding, PassportIdpBindingPayload, PassportIdpBindingQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 账号与外部身份源绑定表 API 服务类
 */
export class PassportIdpBindingApi {
  /**
   * 获取账号与外部身份源绑定表列表
   * @param params 查询参数（可选）
   * @returns 账号与外部身份源绑定表列表
   */
  static async list(params?: PassportIdpBindingQuery): Promise<PassportIdpBinding[]> {
    const http = getHttpClient('default');
    const res = await http.get<PassportIdpBinding[]>('/basis/passport_idp_binding/list', params);
    return res.data || [];
  }

  /**
   * 分页查询账号与外部身份源绑定表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: PassportIdpBindingQuery & PageSelectListDto): Promise<PageData<PassportIdpBinding>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<PassportIdpBinding>>('/basis/passport_idp_binding/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 账号与外部身份源绑定表 ID
   * @returns 账号与外部身份源绑定表详情
   */
  static async getById(id: number): Promise<PassportIdpBinding> {
    const http = getHttpClient('default');
    const res = await http.get<PassportIdpBinding>(`/basis/passport_idp_binding/${id}`);
    return res.data;
  }

  /**
   * 保存账号与外部身份源绑定表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 账号与外部身份源绑定表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的账号与外部身份源绑定表
   */
  static async save(payload: PassportIdpBindingPayload): Promise<PassportIdpBinding> {
    const http = getHttpClient('default');
    const res = await http.post<PassportIdpBinding>('/basis/passport_idp_binding/save', payload);
    return res.data;
  }

  /**
   * 删除账号与外部身份源绑定表
   * @param id 账号与外部身份源绑定表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/passport_idp_binding/${id}`);
  }
}

