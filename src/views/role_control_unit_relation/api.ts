/**
 * role_control_unit_relation相关 API 服务
 * 提供role_control_unit_relation数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { RoleControlUnitRelation, RoleControlUnitRelationPayload, RoleControlUnitRelationQuery } from './type';

/**
 * role_control_unit_relation API 服务类
 */
export class RoleControlUnitRelationApi {
  /**
   * 获取role_control_unit_relation列表
   * @param params 查询参数（可选）
   * @returns role_control_unit_relation列表
   */
  static async list(params?: RoleControlUnitRelationQuery): Promise<RoleControlUnitRelation[]> {
    const http = getHttpClient('default');
    const res = await http.get<RoleControlUnitRelation[]>('/basis/role_control_unit_relation/list', params);
    return res.data || [];
  }

  /**
   * 获取role_control_unit_relation列表
   * 
   * 根据角色 ID 查询到这个角色归属机构的 超管角色的功能权限集合
   * 
   * @param params 查询参数（可选）
   * @returns role_control_unit_relation列表
   */
  static async listByRole(roleId: number): Promise<RoleControlUnitRelation[]> {
    const http = getHttpClient('default');
    const res = await http.get<RoleControlUnitRelation[]>(`/basis/role_control_unit_relation/role/${roleId}`);
    return res.data || [];
  }

  /**
   * 保存role_control_unit_relation（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload role_control_unit_relation数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的role_control_unit_relation
   */
  static async save(payload: RoleControlUnitRelationPayload): Promise<RoleControlUnitRelation> {
    const http = getHttpClient('default');
    const res = await http.post<RoleControlUnitRelation>('/basis/role_control_unit_relation/save', payload);
    return res.data;
  }
}