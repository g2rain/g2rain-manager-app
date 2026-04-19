/**
 * control_unit_resource_relation相关 API 服务
 * 提供control_unit_resource_relation数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ControlUnitResourceRelation, ControlUnitResourceRelationPayload, ControlUnitResourceRelationQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * control_unit_resource_relation API 服务类
 */
export class ControlUnitResourceRelationApi {
  /**
   * 获取control_unit_resource_relation列表
   * @param params 查询参数（可选）
   * @returns control_unit_resource_relation列表
   */
  static async list(params?: ControlUnitResourceRelationQuery): Promise<ControlUnitResourceRelation[]> {
    const http = getHttpClient('default');
    const res = await http.get<ControlUnitResourceRelation[]>('/basis/control_unit_resource_relation/list', params);
    return res.data || [];
  }

  /**
   * 分页查询control_unit_resource_relation列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ControlUnitResourceRelationQuery & PageSelectListDto): Promise<PageData<ControlUnitResourceRelation>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ControlUnitResourceRelation>>('/basis/control_unit_resource_relation/page', params);
    return res.data;
  }

  /**
   * 保存control_unit_resource_relation（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload control_unit_resource_relation数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的control_unit_resource_relation
   */
  static async save(payload: ControlUnitResourceRelationPayload): Promise<ControlUnitResourceRelation> {
    const http = getHttpClient('default');
    const res = await http.post<ControlUnitResourceRelation>('/basis/control_unit_resource_relation/save', payload);
    return res.data;
  }
}