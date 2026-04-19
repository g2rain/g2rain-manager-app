/**
 * control_unit相关 API 服务
 * 提供control_unit数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ControlUnit, ControlUnitPayload, ControlUnitQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * control_unit API 服务类
 */
export class ControlUnitApi {
  /**
   * 获取control_unit列表
   * @param params 查询参数（可选）
   * @returns control_unit列表
   */
  static async list(params?: ControlUnitQuery): Promise<ControlUnit[]> {
    const http = getHttpClient('default');
    const res = await http.get<ControlUnit[]>('/basis/control_unit/list', params);
    return res.data || [];
  }

  /**
   * 分页查询control_unit列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ControlUnitQuery & PageSelectListDto): Promise<PageData<ControlUnit>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ControlUnit>>('/basis/control_unit/page', params);
    return res.data;
  }

  /**
   * 保存control_unit（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload control_unit数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的control_unit
   */
  static async save(payload: ControlUnitPayload): Promise<ControlUnit> {
    const http = getHttpClient('default');
    const res = await http.post<ControlUnit>('/basis/control_unit/save', payload);
    return res.data;
  }

  /**
   * 删除control_unit
   * @param id control_unit ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/control_unit/${id}`);
  }

  /**
   * 切换状态
   * @param id control_unit ID
   * @param status 状态
   */
  static async updateStatus(id: number, status: string): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`/basis/control_unit/${id}/status`, {status});
  }
}