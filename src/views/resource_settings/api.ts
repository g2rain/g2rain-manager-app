/**
 * resource_settings相关 API 服务
 * 提供resource_settings数据的 CRUD 操作接口
 */
import { getHttpClient } from '@/components/http';

/**
 * resource_settings API 服务类
 */
export class ResourceSettingsApi {
  /**
   * 资源上传
   * @param id 应用 ID
   * @returns 上传成功记录
   */
  static async uploadResource(id: number, formData: FormData): Promise<number> {
    const http = getHttpClient('default');
    const res = await http.post<number>(`/basis/resource/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data || 0;
  }
}