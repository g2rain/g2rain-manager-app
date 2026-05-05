/**
 * resource_api相关 API 服务
 * 提供resource_api数据的 CRUD 操作接口
 */

import { getHttpClient } from '@/components/http';
import type {
  ResourceApi,
  ResourceApiPayload,
  ResourceApiQuery,
  UploadResourceApiDto,
} from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * resource_api API 服务类
 */
export class ResourceApiApi {
  /**
   * 获取resource_api列表
   * @param params 查询参数（可选）
   * @returns resource_api列表
   */
  static async list(params?: ResourceApiQuery): Promise<ResourceApi[]> {
    const http = getHttpClient('default');
    const res = await http.get<ResourceApi[]>('/basis/resource_api/list', params);
    return res.data || [];
  }

  /**
   * 分页查询resource_api列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ResourceApiQuery & PageSelectListDto): Promise<PageData<ResourceApi>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ResourceApi>>('/basis/resource_api/page', params);
    return res.data;
  }

  /**
   * 保存resource_api（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload resource_api数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的resource_api
   */
  static async save(payload: ResourceApiPayload): Promise<ResourceApi> {
    const http = getHttpClient('default');
    const res = await http.post<ResourceApi>('/basis/resource_api/save', payload);
    return res.data;
  }

  /**
   * 批量导入resource_api
   * @param serviceCode 服务编码
   * @param payload 导入数据
   * @returns 导入条数
   */
  static async batchImport(serviceCode: string, payload: UploadResourceApiDto): Promise<number> {
    const http = getHttpClient('default');
    const res = await http.post<number>(`/basis/resource_api/${serviceCode}/import`, payload);
    return res.data;
  }

  /**
   * 删除resource_api
   * @param id resource_api ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/resource_api/${id}`);
  }
}

