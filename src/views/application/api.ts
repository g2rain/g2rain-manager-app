/**
 * application相关 API 服务
 * 提供application数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';
import type { Application, ApplicationPayload, ApplicationQuery, ApplicationIdNameMap } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';
import { B } from 'mockjs';

/**
 * application API 服务类
 */
export class ApplicationApi {
  /**
   * 应用是否存在公钥
   * @param id 应用 ID
   * @returns 是否存在公钥
   */
  static async hasPublicKey(id: number): Promise<boolean> {
    const http = getHttpClient('default');
    const res = await http.get<boolean>(`/basis/application/${id}/has_public_key`);
    return res.data || false;
  }

  /**
   * 应用是否存在公钥
   * @param id 应用 ID
   * @returns 是否存在公钥
   */
  static async uploadPublicKey(id: number, formData: FormData): Promise<number> {
    const http = getHttpClient('default');
    const res = await http.post<number>(`/basis/application/${id}/public_key`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data || 0;
  }

  static async downloadPublicKey(id: number): Promise<void> {
    const http = getHttpClient('default');
    const res = await http.request<Blob>({
      url: `/basis/application/${id}/public_key`,
      method: 'GET',
      responseType: 'blob',
    })

    // 根据返回的 Blob 创建下载链接
    // const contentDisposition = res.headers['content-disposition']
    // let filename = 'public_key.pem'
    // if (contentDisposition) {
    //   const match = contentDisposition.match(/filename="(.+)"/)
    //   if (match) filename = match[1]
    // }

    // const blob = new Blob([res.data])
    // const link = document.createElement('a')
    // link.href = URL.createObjectURL(blob)
    // link.download = filename
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)
  }

  /**
   * 获取application列表
   * @param params 查询参数（可选）
   * @returns application列表
   */
  static async id2name(params?: ApplicationQuery): Promise<ApplicationIdNameMap[]> {
    const http = getHttpClient('default');
    const res = await http.get<ApplicationIdNameMap[]>('/basis/application/id_name_map', params);
    return res.data || [];
  }

  /**
   * 获取application列表
   * @param params 查询参数（可选）
   * @returns application列表
   */
  static async list(params?: ApplicationQuery): Promise<Application[]> {
    const http = getHttpClient('default');
    const res = await http.get<Application[]>('/basis/application/list', params);
    return res.data || [];
  }

  /**
   * 分页查询application列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ApplicationQuery & PageSelectListDto): Promise<PageData<Application>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<Application>>('/basis/application/page', params);
    return res.data;
  }

  /**
   * 保存application（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload application数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的application
   */
  static async save(payload: ApplicationPayload): Promise<Application> {
    const http = getHttpClient('default');
    const res = await http.post<Application>('/basis/application/save', payload);
    return res.data;
  }

  /**
   * 删除application
   * @param id application ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/basis/application/${id}`);
  }

  /**
   * 切换状态
   * @param id application ID
   * @param status 状态
   */
  static async updateStatus(id: number, status: string): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`/basis/application/${id}/status`, { status });
  }
}