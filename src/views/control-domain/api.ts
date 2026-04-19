/**
 * control_domain相关 API 服务
 * 提供control_domain数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ControlDomain, ControlDomainPayload, ControlDomainQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * control_domain API 服务类
 */
export class ControlDomainApi {
  /**
   * 获取control_domain列表
   * @param params 查询参数（可选）
   * @returns control_domain列表
   */
  static async list(params?: ControlDomainQuery): Promise<ControlDomain[]> {
    const http = getHttpClient('default');
    const res = await http.get<ControlDomain[]>('/basis/control_domain/list', params);
    return res.data || [];
  }

  /**
   * 分页查询control_domain列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ControlDomainQuery & PageSelectListDto): Promise<PageData<ControlDomain>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ControlDomain>>('/basis/control_domain/page', params);
    return res.data;
  }

  /**
   * 保存control_domain（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload control_domain数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的control_domain
   */
  static async save(payload: ControlDomainPayload): Promise<ControlDomain> {
    const http = getHttpClient('default');
    const res = await http.post<ControlDomain>('/basis/control_domain/save', payload);
    return res.data;
  }

  /**
   * 删除control_domain
   * @param id control_domain ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/control_domain/${id}`);
  }
}