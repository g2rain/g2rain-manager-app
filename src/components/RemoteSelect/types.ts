/**
 * 远程搜索选择组件类型定义
 */

/**
 * 远程数据获取函数接口
 * @param params 查询参数对象，包含 key（名称）、value（ID）和取消请求的 signal
 * @returns Promise<选项数组>
 */
export type FetchDataFunction<T extends Record<string, any> = Record<string, any>> = (
  params: { key?: string; value?: number; signal?: AbortSignal }
) => Promise<T[]>;

export interface RemoteSelectOption {
  [key: string]: any;
}
