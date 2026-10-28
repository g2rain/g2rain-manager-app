/**
 * organ相关 API 服务
 * 提供organ数据的 CRUD 操作接口
 */
import { getHttpClient } from '@runtime/http';
import type { Organ, OrganPayload, OrganQuery, OrganIdNameMap, OrganHierarchicalRelation, OrganClosure } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * organ API 服务类
 */
export class OrganApi {
  /**
   * 获取organ列表
   * @param params 查询参数（可选）
   * @returns organ列表
   */
  static async list(params?: OrganQuery): Promise<Organ[]> {
    const http = getHttpClient('default');
    const res = await http.get<Organ[]>('/basis/organ/list', params);
    return res.data || [];
  }

  /**
   * 机构搜索（用于 RemoteSelect）
   * - value：按机构标识匹配，同时匹配名称包含该数字的机构
   * - key：按名称关键字匹配
   */
  static async searchOrgans(params: { key?: string; value?: number; signal?: AbortSignal } = {}): Promise<OrganIdNameMap[]> {
    const http = getHttpClient('default');
    const res = await http.get<OrganIdNameMap[]>('/basis/organ/search', { id: params.value, organName: params.key }, { signal: params.signal });
    return res.data || [];
  }

  /**
   * 获取organ列表
   * @returns organ列表
   */
  static async getHierarchicalRelations(): Promise<OrganHierarchicalRelation[]> {
    const http = getHttpClient('default');
    const res = await http.get<OrganHierarchicalRelation[]>('/basis/organ/hierarchy');
    return res.data || [];
  }

  /**
   * 分页查询organ列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: OrganQuery & PageSelectListDto): Promise<PageData<Organ>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<Organ>>('/basis/organ/page', params);
    return res.data;
  }

  /**
   * 保存organ（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload organ数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的organ
   */
  static async save(payload: OrganPayload): Promise<Organ> {
    const http = getHttpClient('default');
    const res = await http.post<Organ>('/basis/organ/save', payload);
    return res.data;
  }

  /**
   * 删除organ
   * @param id organ ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/organ/${id}`);
  }

  /**
   * 修改状态
   * @param id organ ID
   * @param status 状态
   */
  static async updateStatus(id: number, status: string): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`/basis/organ/${id}/status`, { status });
  }

  /**
   * 调整归属
   * @param id organ ID
   * @param oc 归属关系
   */
  static async adjustHierarchy(id: number, oc: OrganClosure): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`/basis/organ/${id}/hierarchy`, oc);
  }
}