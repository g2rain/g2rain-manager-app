import { ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { showErrorMessage } from '@/components';
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

function resolveSyncErrorMessage(error: any) {
  const code = error?.errorCode as string | undefined;
  if (code === 'basis.50203') {
    return t('MG_IDP_ENT_SYNC_SNAPSHOT_INCOMPLETE', 'IdP 通讯录快照不完整，已阻断 FULL 对账删除');
  }
  if (code === 'basis.50204') {
    return t('MG_IDP_ENT_SYNC_SNAPSHOT_EMPTY', 'IdP 通讯录快照为空且租户已有同步数据，已阻断 FULL 对账删除');
  }
  if (code === 'basis.50205') {
    return t('MG_IDP_ENT_SYNC_RATIO_EXCEEDED', 'FULL 对账删除比例超过安全阈值，已阻断同步');
  }
  if (code === 'basis.40067') {
    return t('MG_IDP_ENT_SYNC_DINGTALK_ONLY', '当前仅支持钉钉（DINGTALK）通讯录同步');
  }
  return error?.message || t('MG_IDP_ENT_SYNC_FAIL', '同步失败');
}

function formatSyncSuccessMessage(result: TenantIdpSyncResult): string {
  return t(
    'MG_IDP_ENT_SYNC_OK',
    '同步完成：'
      + `部门新增 ${result.departmentsCreated}、更新 ${result.departmentsUpdated}；`
      + `成员新增 ${result.membersCreated}、更新 ${result.membersUpdated}；`
      + `角色分配 ${result.rolesAssigned ?? 0}；`
      + `耗时 ${result.elapsedMs}ms`,
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
    } catch (error: any) {
      showErrorMessage(error || t('MG_IDP_ENT_SYNC_ROLE_LOAD_FAIL', '加载角色列表失败'));
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
          `将从 IdP 拉取通讯录并初始化部门与员工，并为快照内全部成员分配角色「${roleLabel}」；FULL 模式会对快照外数据做对账处理，是否继续？`,
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
    } catch (error: any) {
      showErrorMessage(resolveSyncErrorMessage(error));
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
