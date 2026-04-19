/**
 * user相关 API 服务
 * 提供user数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { User, UserPayload, UserQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * user API 服务类
 */
export class UserApi {
  /**
   * 查询user列表
   * 根据角色 ID 查询到角色归属的机构, 通过机构ID获取所有的用户列表
   * 
   * @param roleId 角色 ID
   * @returns user数据
   */
  static async listByRole(roleId: number): Promise<User[]> {
    const http = getHttpClient('default');
    const res = await http.get<User[]>(`/basis/user/role/${roleId}`);
    return res.data;
  }

  /**
   * 获取user列表
   * @param params 查询参数（可选）
   * @returns user列表
   */
  static async list(params?: UserQuery): Promise<User[]> {
    const http = getHttpClient('default');
    const res = await http.get<User[]>('/basis/user/list', params);
    return res.data || [];
  }

  /**
   * 分页查询user列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: UserQuery & PageSelectListDto): Promise<PageData<User>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<User>>('/basis/user/page', params);
    return res.data;
  }

  /**
   * 保存user（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload user数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的user
   */
  static async save(payload: UserPayload): Promise<User> {
    const http = getHttpClient('default');
    const res = await http.post<User>('/basis/user/save', payload);
    return res.data;
  }

  /**
   * 删除user
   * @param id user ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/user/${id}`);
  }
}