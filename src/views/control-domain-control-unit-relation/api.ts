/**
 * control_domain_control_unit_relation相关 API 服务
 * 提供control_domain_control_unit_relation数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ControlDomainControlUnitRelation, ControlDomainControlUnitRelationPayload, ControlDomainControlUnitRelationQuery } from './type';

/**
 * control_domain_control_unit_relation API 服务类
 */
export class ControlDomainControlUnitRelationApi {
  /**
   * 获取control_domain_control_unit_relation列表
   * @param params 查询参数（可选）
   * @returns control_domain_control_unit_relation列表
   */
  static async list(params?: ControlDomainControlUnitRelationQuery): Promise<ControlDomainControlUnitRelation[]> {
    const http = getHttpClient('default');
    const res = await http.get<ControlDomainControlUnitRelation[]>('/basis/control_domain_control_unit_relation/list', params);
    return res.data || [];
  }

  /**
   * 保存control_domain_control_unit_relation（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload control_domain_control_unit_relation数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的control_domain_control_unit_relation
   */
  static async save(payload: ControlDomainControlUnitRelationPayload): Promise<ControlDomainControlUnitRelation> {
    const http = getHttpClient('default');
    const res = await http.post<ControlDomainControlUnitRelation>('/basis/control_domain_control_unit_relation/save', payload);
    return res.data;
  }
}