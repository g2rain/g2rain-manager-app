/**
 * login_token相关 API 服务
 * 提供login_token数据的 CRUD 操作接口
 */

import { getHttpClient } from '@/components/http';
import type { LoginToken, LoginTokenQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * login_token API 服务类
 */
export class LoginTokenApi {
  /**
   * 获取login_token列表
   * @param params 查询参数（可选）
   * @returns login_token列表
   */
  static async list(params?: LoginTokenQuery): Promise<LoginToken[]> {
    const http = getHttpClient('default');
    const res = await http.get<LoginToken[]>('/basis/login_token/list', params);
    return res.data || [];
  }

  /**
   * 分页查询login_token列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: LoginTokenQuery & PageSelectListDto): Promise<PageData<LoginToken>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<LoginToken>>('/basis/login_token/page', params);
    return res.data;
  }
}

