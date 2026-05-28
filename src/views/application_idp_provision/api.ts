/**
 * 外部身份源应用与平台应用的绑定相关 API 服务
 * 提供外部身份源应用与平台应用的绑定数据的 CRUD 操作接口
 */

import { getHttpClient } from '@/components/http';
import type { ApplicationIdpProvision, ApplicationIdpProvisionPayload, ApplicationIdpProvisionQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 外部身份源应用与平台应用的绑定 API 服务类
 */
export class ApplicationIdpProvisionApi {
  /**
   * 获取外部身份源应用与平台应用的绑定列表
   * @param params 查询参数（可选）
   * @returns 外部身份源应用与平台应用的绑定列表
   */
  static async list(params?: ApplicationIdpProvisionQuery): Promise<ApplicationIdpProvision[]> {
    const http = getHttpClient('default');
    const res = await http.get<ApplicationIdpProvision[]>('/basis/application_idp_provision/list', params);
    return res.data || [];
  }

  /**
   * 分页查询外部身份源应用与平台应用的绑定列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ApplicationIdpProvisionQuery & PageSelectListDto): Promise<PageData<ApplicationIdpProvision>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ApplicationIdpProvision>>('/basis/application_idp_provision/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 外部身份源应用与平台应用的绑定 ID
   * @returns 外部身份源应用与平台应用的绑定详情
   */
  static async getById(id: number): Promise<ApplicationIdpProvision> {
    const http = getHttpClient('default');
    const res = await http.get<ApplicationIdpProvision>(`/basis/application_idp_provision/${id}`);
    return res.data;
  }

  /**
   * 保存外部身份源应用与平台应用的绑定（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 外部身份源应用与平台应用的绑定数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的外部身份源应用与平台应用的绑定
   */
  static async save(payload: ApplicationIdpProvisionPayload): Promise<ApplicationIdpProvision> {
    const http = getHttpClient('default');
    const res = await http.post<ApplicationIdpProvision>('/basis/application_idp_provision/save', payload);
    return res.data;
  }

  /**
   * 删除外部身份源应用与平台应用的绑定
   * @param id 外部身份源应用与平台应用的绑定 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/application_idp_provision/${id}`);
  }
}

