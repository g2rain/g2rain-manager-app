/**
 * resource_page_element相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * resource_page_element接口
 */
export interface ResourcePageElement extends BaseVo {
  applicationId: number;
  pageCode: string;
  pageElementName: string;
  pageElementCode: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ResourcePageElementPayload {
  id?: number; // 更新时传入 ID，新增时不传
  applicationId?: number;
  pageCode?: string;
  pageElementName?: string;
  pageElementCode?: string;
}

/**
 * resource_page_element查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ResourcePageElementQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationId?: number;
  pageCode?: string;
  pageElementName?: string;
  pageElementCode?: string;
}