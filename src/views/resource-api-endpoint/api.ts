/**
 * resource_api_endpoint相关 API 服务
 * 提供resource_api_endpoint数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ResourceApiEndpoint, ResourceApiEndpointPayload, ResourceApiEndpointQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * resource_api_endpoint API 服务类
 */
export class ResourceApiEndpointApi {
  /**
   * 获取resource_api_endpoint列表
   * @param params 查询参数（可选）
   * @returns resource_api_endpoint列表
   */
  static async list(params?: ResourceApiEndpointQuery): Promise<ResourceApiEndpoint[]> {
    const http = getHttpClient('default');
    const res = await http.get<ResourceApiEndpoint[]>('/basis/resource_api_endpoint/list', params);
    return res.data || [];
  }

  /**
   * 分页查询resource_api_endpoint列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ResourceApiEndpointQuery & PageSelectListDto): Promise<PageData<ResourceApiEndpoint>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ResourceApiEndpoint>>('/basis/resource_api_endpoint/page', params);
    return res.data;
  }

  /**
   * 保存resource_api_endpoint（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload resource_api_endpoint数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的resource_api_endpoint
   */
  static async save(payload: ResourceApiEndpointPayload): Promise<ResourceApiEndpoint> {
    const http = getHttpClient('default');
    const res = await http.post<ResourceApiEndpoint>('/basis/resource_api_endpoint/save', payload);
    return res.data;
  }

  /**
   * 删除resource_api_endpoint
   * @param id resource_api_endpoint ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/resource_api_endpoint/${id}`);
  }
}