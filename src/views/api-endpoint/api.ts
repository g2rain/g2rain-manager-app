/**
 * api_endpoint相关 API 服务
 * 提供api_endpoint数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ApiEndpoint, ApiEndpointPayload, ApiEndpointQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * api_endpoint API 服务类
 */
export class ApiEndpointApi {
  /**
   * 获取api_endpoint 标签列表
   * @returns api_endpoint列表
   */
  static async apiTags(): Promise<string[]> {
    const http = getHttpClient('default');
    const res = await http.get<string[]>('/basis/api_endpoint/api_tags');
    return res.data || [];
  }

  /**
   * 获取api_endpoint列表
   * @param params 查询参数（可选）
   * @returns api_endpoint列表
   */
  static async list(params?: ApiEndpointQuery): Promise<ApiEndpoint[]> {
    const http = getHttpClient('default');
    const res = await http.get<ApiEndpoint[]>('/basis/api_endpoint/list', params);
    return res.data || [];
  }

  /**
   * 分页查询api_endpoint列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ApiEndpointQuery & PageSelectListDto): Promise<PageData<ApiEndpoint>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ApiEndpoint>>('/basis/api_endpoint/page', params);
    return res.data;
  }

  /**
   * 保存api_endpoint（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload api_endpoint数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的api_endpoint
   */
  static async save(payload: ApiEndpointPayload): Promise<ApiEndpoint> {
    const http = getHttpClient('default');
    const res = await http.post<ApiEndpoint>('/basis/api_endpoint/save', payload);
    return res.data;
  }

  /**
   * 删除api_endpoint
   * @param id api_endpoint ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/api_endpoint/${id}`);
  }
}