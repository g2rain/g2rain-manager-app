/**
 * resource_page相关 API 服务
 * 提供resource_page数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ResourcePage, ResourcePagePayload, ResourcePageQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * resource_page API 服务类
 */
export class ResourcePageApi {
  /**
   * 获取resource_page列表
   * @param params 查询参数（可选）
   * @returns resource_page列表
   */
  static async list(params?: ResourcePageQuery): Promise<ResourcePage[]> {
    const http = getHttpClient('default');
    const res = await http.get<ResourcePage[]>('/basis/resource_page/list', params);
    return res.data || [];
  }

  /**
   * 分页查询resource_page列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ResourcePageQuery & PageSelectListDto): Promise<PageData<ResourcePage>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ResourcePage>>('/basis/resource_page/page', params);
    return res.data;
  }

  /**
   * 保存resource_page（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload resource_page数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的resource_page
   */
  static async save(payload: ResourcePagePayload): Promise<ResourcePage> {
    const http = getHttpClient('default');
    const res = await http.post<ResourcePage>('/basis/resource_page/save', payload);
    return res.data;
  }

  /**
   * 删除resource_page
   * @param id resource_page ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/resource_page/${id}`);
  }
}