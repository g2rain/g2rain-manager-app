/**
 * service_registry相关 API 服务
 * 提供service_registry数据的 CRUD 操作接口
 */

import { getHttpClient } from '@/components/http';
import type { ServiceRegistry, ServiceRegistryPayload, ServiceRegistryQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * service_registry API 服务类
 */
export class ServiceRegistryApi {
  /**
   * 获取service_registry列表
   * @param params 查询参数（可选）
   * @returns service_registry列表
   */
  static async list(params?: ServiceRegistryQuery): Promise<ServiceRegistry[]> {
    const http = getHttpClient('default');
    const res = await http.get<ServiceRegistry[]>('/basis/service_registry/list', params);
    return res.data || [];
  }

  /**
   * 分页查询service_registry列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ServiceRegistryQuery & PageSelectListDto): Promise<PageData<ServiceRegistry>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ServiceRegistry>>('/basis/service_registry/page', params);
    return res.data;
  }

  /**
   * 保存service_registry（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload service_registry数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的service_registry
   */
  static async save(payload: ServiceRegistryPayload): Promise<ServiceRegistry> {
    const http = getHttpClient('default');
    const res = await http.post<ServiceRegistry>('/basis/service_registry/save', payload);
    return res.data;
  }

  /**
   * 删除service_registry
   * @param id service_registry ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/service_registry/${id}`);
  }
}

