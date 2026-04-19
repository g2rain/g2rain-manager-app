/**
 * passport相关 API 服务
 * 提供passport数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { Passport, PassportPayload, PassportQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * passport API 服务类
 */
export class PassportApi {
  /**
   * 获取passport列表
   * @param params 查询参数（可选）
   * @returns passport列表
   */
  static async list(params?: PassportQuery): Promise<Passport[]> {
    const http = getHttpClient('default');
    const res = await http.get<Passport[]>('/basis/passport/list', params);
    return res.data || [];
  }

  /**
   * 分页查询passport列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: PassportQuery & PageSelectListDto): Promise<PageData<Passport>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<Passport>>('/basis/passport/page', params);
    return res.data;
  }

  /**
   * 保存passport（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload passport数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的passport
   */
  static async save(payload: PassportPayload): Promise<Passport> {
    const http = getHttpClient('default');
    const res = await http.post<Passport>('/basis/passport/save', payload);
    return res.data;
  }

  /**
   * 删除passport
   * @param id passport ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/passport/${id}`);
  }

  /**
   * 修改状态
   * @param id passport ID
   * @param status 状态
   */
  static async updateStatus(id: number, status: string): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`/basis/passport/${id}/status`, { status });
  }
}