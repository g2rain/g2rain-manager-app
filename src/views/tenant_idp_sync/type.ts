/**
 * 租户 IdP 同步类型定义
 */

export interface TenantIdpSyncPayload {
  organId: number;
  idpType?: string;
  bindMode?: string;
  syncMode?: 'FULL' | 'INCREMENTAL';
}

export interface TenantIdpSyncResult {
  departmentsCreated: number;
  departmentsUpdated: number;
  membersCreated: number;
  membersUpdated: number;
  bindingsCreated: number;
  bindingsUpdated: number;
  departmentRelationsCreated: number;
  membersDeleted: number;
  bindingsDeleted: number;
  departmentsDisabled: number;
  departmentRelationsRemoved: number;
  elapsedMs: number;
}
