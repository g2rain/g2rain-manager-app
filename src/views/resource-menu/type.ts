/**
 * resource_menu相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * resource_menu接口
 */
export interface ResourceMenu extends BaseVo {
  parentId: number;
  applicationId: number;
  menuName: string;
  menuCode: string;
  linkPath: string;
  icon: string;
  menuSortOrder: number;
  children?: ResourceMenu[];
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ResourceMenuPayload {
  id?: number; // 更新时传入 ID，新增时不传
  parentId?: number;
  applicationId?: number;
  menuName?: string;
  menuCode?: string;
  linkPath?: string;
  icon?: string;
  menuSortOrder?: number;
}

/**
 * resource_menu查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ResourceMenuQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationId?: number;
  menuName?: string;
  menuCode?: string;
}