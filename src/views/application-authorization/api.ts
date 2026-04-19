/**
 * application_authorization相关 API 服务
 * 提供application_authorization数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ApplicationAuthorization, ApplicationAuthorizationQuery, ApplicationAuthorizationPayload } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * application_authorization API 服务类
 */
export class ApplicationAuthorizationApi {
  /**
   * 获取application_authorization列表
   * @param params 查询参数（可选）
   * @returns application_authorization列表
   */
  static async list(params?: ApplicationAuthorizationQuery): Promise<ApplicationAuthorization[]> {
    const http = getHttpClient('default');
    const res = await http.get<ApplicationAuthorization[]>('/basis/application_authorization/list', params);
    return res.data || [];
  }

  /**
   * 保存application-authorization（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload application_authorization数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的application_authorization
   */
  static async save(payload: ApplicationAuthorizationPayload): Promise<ApplicationAuthorization> {
    const http = getHttpClient('default');
    const res = await http.post<ApplicationAuthorization>('/basis/application_authorization/save', payload);
    return res.data;
  }

  /**
   * 分页查询application_authorization列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ApplicationAuthorizationQuery & PageSelectListDto): Promise<PageData<ApplicationAuthorization>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ApplicationAuthorization>>('/basis/application_authorization/page', params);
    return res.data;
  }

  /**
   * 切换状态
   * @param id control_unit ID
   * @param status 状态
   */
  static async updateStatus(id: number, status: string): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`/basis/application_authorization/${id}/status`, { status });
  }
}