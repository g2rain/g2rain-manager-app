/**
 * role相关 API 服务
 * 提供role数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { Role, RolePayload, RoleQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * role API 服务类
 */
export class RoleApi {
  /**
   * 获取role列表
   * @param params 查询参数（可选）
   * @returns role列表
   */
  static async list(params?: RoleQuery): Promise<Role[]> {
    const http = getHttpClient('default');
    const res = await http.get<Role[]>('/basis/role/list', params);
    return res.data || [];
  }

  /**
   * 分页查询role列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: RoleQuery & PageSelectListDto): Promise<PageData<Role>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<Role>>('/basis/role/page', params);
    return res.data;
  }

  /**
   * 保存role（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload role数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的role
   */
  static async save(payload: RolePayload): Promise<Role> {
    const http = getHttpClient('default');
    const res = await http.post<Role>('/basis/role/save', payload);
    return res.data;
  }

  /**
   * 删除role
   * @param id role ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/role/${id}`);
  }
}