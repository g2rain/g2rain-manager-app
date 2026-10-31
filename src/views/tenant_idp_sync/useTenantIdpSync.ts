import { ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { TenantIdpSyncApi } from './api';
import type { TenantIdpSyncResult } from './type';
import { RoleApi } from '../role/api';
import type { Role } from '../role/type';

export interface TenantIdpSyncTarget {
  id: number;
  organId?: number;
  idpType: string;
  bindMode?: string;
}

const SUPPORTED_SYNC_IDP_TYPE = 'DINGTALK';

function formatSyncSuccessMessage(result: TenantIdpSyncResult): string {
  return t(
    'MG_IDP_ENT_SYNC_OK',
    {
      departmentsCreated: result.departmentsCreated,
      departmentsUpdated: result.departmentsUpdated,
      membersCreated: result.membersCreated,
      membersUpdated: result.membersUpdated,
      rolesAssigned: result.rolesAssigned ?? 0,
      elapsedMs: result.elapsedMs,
    },
    '同步完成：部门新增 {departmentsCreated}、更新 {departmentsUpdated}；成员新增 {membersCreated}、更新 {membersUpdated}；角色分配 {rolesAssigned}；耗时 {elapsedMs}ms',
  );
}

export function useTenantIdpSync() {
  const syncLoadingId = ref<number | null>(null);
  const syncRolesByOrganId = ref<Record<number, Role[]>>({});
  const syncRolesLoadingOrganId = ref<number | null>(null);

  const isSyncSupported = (row: TenantIdpSyncTarget) =>
    row.bindMode === 'INTERNAL' && row.idpType === SUPPORTED_SYNC_IDP_TYPE;

  const resolveSyncTooltipContent = (row: TenantIdpSyncTarget) => {
    if (row.bindMode !== 'INTERNAL') {
      return t('MG_IDP_ENT_SYNC_INTERNAL_ONLY', '首期仅支持企业内部应用（INTERNAL）同步');
    }
    if (row.idpType !== SUPPORTED_SYNC_IDP_TYPE) {
      return t('MG_IDP_ENT_SYNC_DINGTALK_ONLY', '首期仅支持钉钉（DINGTALK）通讯录同步');
    }
    return '';
  };

  const getSyncRoles = (organId?: number) => {
    if (!organId) {
      return [];
    }
    return syncRolesByOrganId.value[organId] ?? [];
  };

  const handleSyncDropdownVisible = async (visible: boolean, row: TenantIdpSyncTarget) => {
    if (!visible || !row?.organId || !isSyncSupported(row)) {
      return;
    }
    if (syncRolesByOrganId.value[row.organId]) {
      return;
    }
    syncRolesLoadingOrganId.value = row.organId;
    try {
      syncRolesByOrganId.value[row.organId] = await RoleApi.list({ organId: row.organId });
    } catch {
      syncRolesByOrganId.value[row.organId] = [];
    } finally {
      syncRolesLoadingOrganId.value = null;
    }
  };

  const handleSync = async (row: TenantIdpSyncTarget, roleId: number) => {
    if (!row?.organId || !isSyncSupported(row) || !roleId) {
      return;
    }

    const roles = getSyncRoles(row.organId);
    const selectedRole = roles.find((role) => role.id === roleId);
    const roleLabel = selectedRole
      ? `${selectedRole.roleName} (${selectedRole.roleType})`
      : String(roleId);

    try {
      await ElMessageBox.confirm(
        t(
          'MG_IDP_ENT_SYNC_CONFIRM_WITH_ROLE',
          { role: roleLabel },
          '将从 IdP 拉取通讯录并初始化部门与员工，并为快照内全部成员分配角色「{role}」；FULL 模式会对快照外数据做对账处理，是否继续？',
        ),
        t('G2_LBL_TIP', '提示'),
        { type: 'warning' },
      );
    } catch {
      return;
    }

    syncLoadingId.value = row.id;
    try {
      const result = await TenantIdpSyncApi.sync({
        organId: row.organId,
        idpType: row.idpType,
        bindMode: row.bindMode,
        syncMode: 'FULL',
        roleId,
      });
      ElMessage.success(formatSyncSuccessMessage(result));
    } finally {
      syncLoadingId.value = null;
    }
  };

  return {
    syncLoadingId,
    syncRolesLoadingOrganId,
    isSyncSupported,
    resolveSyncTooltipContent,
    getSyncRoles,
    handleSyncDropdownVisible,
    handleSync,
  };
}
