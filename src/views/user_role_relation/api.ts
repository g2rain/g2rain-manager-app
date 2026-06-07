/**
 * user_role_relation相关 API 服务
 * 提供user_role_relation数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { UserRoleRelation, UserRoleRelationPayload, UserRoleRelationQuery } from './type';

/**
 * user_role_relation API 服务类
 */
export class UserRoleRelationApi {
  /**
   * 获取user_role_relation列表
   * @param params 查询参数（可选）
   * @returns user_role_relation列表
   */
  static async list(params?: UserRoleRelationQuery): Promise<UserRoleRelation[]> {
    const http = getHttpClient('default');
    const res = await http.get<UserRoleRelation[]>('/basis/user_role_relation/list', params);
    return res.data || [];
  }

  /**
   * 保存user_role_relation（新增或删除）
   * @param payload user_role_relation数据
   * @returns 保存后的user_role_relation
   */
  static async assignUsers(payload: UserRoleRelationPayload): Promise<UserRoleRelation> {
    const http = getHttpClient('default');
    const res = await http.post<UserRoleRelation>('/basis/user_role_relation/assign_users', payload);
    return res.data;
  }
}