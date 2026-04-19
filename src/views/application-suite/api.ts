/**
 * application_suite相关 API 服务
 * 提供application_suite数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { ApplicationSuite, ApplicationSuitePayload, ApplicationSuiteQuery } from './type';

/**
 * application_suite API 服务类
 */
export class ApplicationSuiteApi {
  /**
   * 获取application_suite列表
   * @param params 查询参数（可选）
   * @returns application_suite列表
   */
  static async list(params?: ApplicationSuiteQuery): Promise<ApplicationSuite[]> {
    const http = getHttpClient('default');
    const res = await http.get<ApplicationSuite[]>('/basis/application_suite/list', params);
    return res.data || [];
  }

  /**
   * 保存application_suite（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload application_suite数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的application_suite
   */
  static async save(payload: ApplicationSuitePayload): Promise<ApplicationSuite> {
    const http = getHttpClient('default');
    const res = await http.post<ApplicationSuite>('/basis/application_suite/save', payload);
    return res.data;
  }
}