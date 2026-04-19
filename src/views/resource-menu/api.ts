/**
 * resource_menu相关 API 服务
 * 提供resource_menu数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ResourceMenu, ResourceMenuPayload, ResourceMenuQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * resource_menu API 服务类
 */
export class ResourceMenuApi {
  /**
   * 获取resource_menu列表
   * @param params 查询参数（可选）
   * @returns resource_menu列表
   */
  static async list(params?: ResourceMenuQuery): Promise<ResourceMenu[]> {
    const http = getHttpClient('default');
    const res = await http.get<ResourceMenu[]>('/basis/resource_menu/list', params);
    return res.data || [];
  }

  /**
   * 分页查询resource_menu列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ResourceMenuQuery & PageSelectListDto): Promise<PageData<ResourceMenu>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ResourceMenu>>('/basis/resource_menu/page', params);
    return res.data;
  }

  /**
   * 保存resource_menu（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload resource_menu数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的resource_menu
   */
  static async save(payload: ResourceMenuPayload): Promise<ResourceMenu> {
    const http = getHttpClient('default');
    const res = await http.post<ResourceMenu>('/basis/resource_menu/save', payload);
    return res.data;
  }

  /**
   * 删除resource_menu
   * @param id resource_menu ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/resource_menu/${id}`);
  }
}