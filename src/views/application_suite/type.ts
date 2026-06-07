/**
 * application_suite相关类型定义
 */
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * application_suite接口
 */
export interface ApplicationSuite extends BaseVo {
  applicationId: number;
  masterApplicationId: number;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ApplicationSuitePayload {
  applicationId?: number;
  masterApplicationIds?: number[];
  deleteMasterApplicationIds?: number[];
}

/**
 * application_suite查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ApplicationSuiteQuery extends BaseSelectListDto {
  // 业务查询字段
  applicationId?: number;
}