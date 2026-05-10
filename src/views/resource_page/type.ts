/**
 * resource_page相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * resource_page接口
 */
export interface ResourcePage extends BaseVo {
  applicationId: number;
  pageName: string;
  pageCode: string;
  linkPath: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ResourcePagePayload {
  id?: number; // 更新时传入 ID，新增时不传
  applicationId?: number;
  pageName?: string;
  pageCode?: string;
  linkPath?: string;
}

/**
 * resource_page查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ResourcePageQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationId?: number;
  pageName?: string;
  pageCode?: string;
}