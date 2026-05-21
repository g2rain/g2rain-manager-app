/**
 * 个人静态访问令牌相关 API 服务
 * 提供个人静态访问令牌数据的 CRUD 操作接口
 */

import { getHttpClient } from '@/components/http';
import type { PersonalStaticAccessToken, PersonalStaticAccessTokenPayload, PersonalStaticAccessTokenQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * 个人静态访问令牌 API 服务类
 */
export class PersonalStaticAccessTokenApi {
  /**
   * 获取个人静态访问令牌列表
   * @param params 查询参数（可选）
   * @returns 个人静态访问令牌列表
   */
  static async list(params?: PersonalStaticAccessTokenQuery): Promise<PersonalStaticAccessToken[]> {
    const http = getHttpClient('default');
    const res = await http.get<PersonalStaticAccessToken[]>('/basis/personal_static_access_token/list', params);
    return res.data || [];
  }

  /**
   * 分页查询个人静态访问令牌列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: PersonalStaticAccessTokenQuery & PageSelectListDto): Promise<PageData<PersonalStaticAccessToken>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<PersonalStaticAccessToken>>('/basis/personal_static_access_token/page', params);
    return res.data;
  }

  /**
   * 保存个人静态访问令牌（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 个人静态访问令牌数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的个人静态访问令牌
   */
  static async save(payload: PersonalStaticAccessTokenPayload): Promise<PersonalStaticAccessToken> {
    const http = getHttpClient('default');
    const res = await http.post<PersonalStaticAccessToken>('/basis/personal_static_access_token/save', payload);
    return res.data;
  }

  /**
   * 删除个人静态访问令牌
   * @param id 个人静态访问令牌 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/personal_static_access_token/${id}`);
  }
}

