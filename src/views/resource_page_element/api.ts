/**
 * resource_page_element相关 API 服务
 * 提供resource_page_element数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ResourcePageElement, ResourcePageElementPayload, ResourcePageElementQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * resource_page_element API 服务类
 */
export class ResourcePageElementApi {
  /**
   * 获取resource_page_element列表
   * @param params 查询参数（可选）
   * @returns resource_page_element列表
   */
  static async list(params?: ResourcePageElementQuery): Promise<ResourcePageElement[]> {
    const http = getHttpClient('default');
    const res = await http.get<ResourcePageElement[]>('/basis/resource_page_element/list', params);
    return res.data || [];
  }

  /**
   * 分页查询resource_page_element列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ResourcePageElementQuery & PageSelectListDto): Promise<PageData<ResourcePageElement>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ResourcePageElement>>('/basis/resource_page_element/page', params);
    return res.data;
  }

  /**
   * 保存resource_page_element（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload resource_page_element数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的resource_page_element
   */
  static async save(payload: ResourcePageElementPayload): Promise<ResourcePageElement> {
    const http = getHttpClient('default');
    const res = await http.post<ResourcePageElement>('/basis/resource_page_element/save', payload);
    return res.data;
  }

  /**
   * 删除resource_page_element
   * @param id resource_page_element ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/resource_page_element/${id}`);
  }
}