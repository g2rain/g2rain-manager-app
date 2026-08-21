<template>
  <div class="role-page">
    <!-- 查询表单 -->
    <el-card class="role-page__search" shadow="never">
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_FIELD_ORGAN', '所属机构')">
          <OrganSelect v-model="queryForm.organId" :api-method="OrganApi.searchOrgans" :placeholder="$t('MG_PH_ORGAN', '请选择所属机构')" width="200px" />
        </el-form-item>

        <el-form-item :label="$t('MG_ROLE_FIELD_TYPE', '角色类型')">
          <DictSelect v-model="queryForm.roleType" usage-code="ROLE_TYPE" :api-method="DictItemApi.select" :placeholder="$t('MG_ROLE_PH_TYPE', '请选择角色类型')" />
        </el-form-item>

        <el-form-item :label="$t('MG_ROLE_FIELD_NAME', '角色名称')">
          <el-input v-model="queryForm.roleName" :placeholder="$t('MG_ROLE_PH_NAME', '请输入角色名称')" clearable style="width: 200px" />
        </el-form-item>

        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <div class="role-page__header">
      <div class="role-page__title-group">
        <h2>{{ $t('MG_ROLE_TITLE', '管理角色数据') }}</h2>
      </div>
      <el-button type="primary" v-permission="'role:add'" @click="handleCreate">{{ $t('MG_ROLE_BTN_ADD', '新增角色') }}</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('MG_ROLE_COL_ID', '角色序号')" width="120" />

      <el-table-column prop="organName" :label="$t('MG_FIELD_ORGAN', '所属机构')" width="140" />

      <el-table-column prop="roleType" :label="$t('MG_ROLE_FIELD_TYPE', '角色类型')" width="140">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.roleType" usage-code="ROLE_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="roleName" :label="$t('MG_ROLE_FIELD_NAME', '角色名称')" width="160" />

      <el-table-column :label="$t('MG_ROLE_FIELD_PERMS', '功能权限')" min-width="220">
        <template #default="{ row }">
          <RolePermissionTags :items="rolePermsMap[row.id] || []" />
        </template>
      </el-table-column>

      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />

      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />

      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="300">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'role:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="success" v-permission="'role:users_assign'" link size="small"
            @click="handleAssignUsers(row)">{{ $t('MG_ROLE_BTN_ASSIGN_USERS', '分配用户') }}</el-button>
          <el-button type="warning" v-permission="'role:control_utils_assign'" link size="small"
            @click="handleAssignControlUtils(row)">{{ $t('MG_ROLE_BTN_ASSIGN_CTRL', '分配功能权限') }}</el-button>
          <el-button type="danger" v-permission="'role:delete'" v-if="row.roleType !== 'ADMIN'" link size="small"
            @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <div class="role-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <RoleEditDialog
      v-model="editDialogVisible"
      mode="manage"
      :role-id="editTarget.roleId"
      :role-name="editTarget.roleName"
      :organ-id="editTarget.organId"
      :organ-name="editTarget.organName"
      @success="handleRoleEditSuccess"
    />

    <el-dialog v-model="detailDialogVisible" :title="$t('MG_ROLE_DETAIL', '角色明细')" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('MG_ROLE_COL_ID', '角色序号')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_FIELD_ORGAN', '所属机构')">{{ currentRow?.organName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_ROLE_FIELD_TYPE', '角色类型')">
          <el-tag>
            <DictText :value="currentRow?.roleType" usage-code="ROLE_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_ROLE_FIELD_NAME', '角色名称')">{{ currentRow?.roleName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="assignUsersDialog.visible" :title="$t('MG_ROLE_DLG_ASSIGN_USERS', '分配用户')" width="520px">
      <el-select-v2
        v-model="selectedUsers"
        :options="allUsers"
        filterable
        multiple
        :placeholder="$t('MG_ROLE_PH_USERS', '请选择用户')"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetAssignUsersDialog">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="assignUsers">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="assignControlUtilsDialog.visible" :title="$t('MG_ROLE_DLG_ASSIGN_CTRL', '分配功能权限')" width="600px">
      <el-transfer
        v-model="selectedControlUtils"
        :data="allControlUtils"
        filterable
        :filter-placeholder="$t('MG_ROLE_TRANSFER_FILTER', '搜索功能权限')"
        :titles="transferTitles"
      >
        <template #default="{ option }">
          <PermissionTooltip
            :name="option.label"
            :description="option.description"
          >
            <span>{{ option.label }}</span>
          </PermissionTooltip>
        </template>
      </el-transfer>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetAssignControlUtilsDialog">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="assignControlUtils" :disabled="assignControlUtilsDialog.isDisabled">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { RoleApi } from './api';
import { UserApi } from '../user/api';
import { UserRoleRelationApi } from '../user_role_relation/api';
import { OrganApi } from '../organ/api';
import { DictItemApi } from '../dict/api';
import { RoleControlUnitRelationApi } from '../role_control_unit_relation/api';
import type { RoleControlUnitRelation } from '../role_control_unit_relation/type';
import type { Role, RoleQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, OrganSelect, DictSelect, DictText } from '@/components';
import RoleEditDialog from './RoleEditDialog.vue';
import RolePermissionTags from './RolePermissionTags.vue';
import PermissionTooltip from './PermissionTooltip.vue';

const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

const queryForm = reactive({
  organId: undefined as number | undefined,
  roleType: '',
  roleName: '',
});

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const tableData = ref<Role[]>([]);
const rolePermsMap = reactive<Record<number, RoleControlUnitRelation[]>>({});

const loadRolePermissions = async (roles: Role[]) => {
  Object.keys(rolePermsMap).forEach((key) => {
    delete rolePermsMap[Number(key)];
  });
  if (!roles.length) return;

  for (const role of roles) {
    rolePermsMap[role.id] = [];
  }

  try {
    const relations = await RoleControlUnitRelationApi.list({
      roleIds: roles.map((role) => role.id),
    });
    for (const relation of relations) {
      if (!rolePermsMap[relation.roleId]) {
        rolePermsMap[relation.roleId] = [];
      }
      rolePermsMap[relation.roleId].push(relation);
    }
  } catch {
    // 后端尚未支持 roleIds 时降级为按角色并行查询
    await Promise.all(
      roles.map(async (role) => {
        try {
          rolePermsMap[role.id] = await RoleControlUnitRelationApi.list({ roleId: role.id });
        } catch {
          rolePermsMap[role.id] = [];
        }
      }),
    );
  }
};

const loadData = async () => {
  try {
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as RoleQuery;

    const pageData = await RoleApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & RoleQuery);

    tableData.value = pageData.records;
    pagination.total = pageData.total;
    await loadRolePermissions(pageData.records);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    ElMessage.error(msg);
  }
};

const handleSortChange = (params: Record<string, string>) => {
  queryFormRef.value?.updateSorts(params);
};

const handleSearch = () => {
  pagination.pageNum = 1;
  loadData();
};

const handleReset = () => {
  baseQueryForm.id = undefined;
  baseQueryForm.createTime = undefined;
  baseQueryForm.updateTime = undefined;
  baseQueryForm.sorts = undefined;
  queryForm.organId = undefined;
  queryForm.roleType = '';
  queryForm.roleName = '';
  pagination.pageNum = 1;
  loadData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  loadData();
};

const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

const currentRow = ref<Role | null>(null);
const detailDialogVisible = ref(false);

const handleView = (row: Role) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

const handleDelete = (row: Role) => {
  ElMessageBox.confirm(
    t('MG_ROLE_DEL_CONFIRM', `确认删除角色「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await RoleApi.remove(row.id);
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败');
        ElMessage.error(msg);
      }
    })
    .catch(() => { });
};

const editDialogVisible = ref(false);
const editTarget = reactive({
  roleId: null as number | null,
  roleName: null as string | null,
  organId: null as number | null,
  organName: null as string | null,
});

const transferTitles = computed(() => [
  t('MG_ROLE_TRANSFER_AVAILABLE', '可选功能权限'),
  t('MG_ROLE_TRANSFER_SELECTED', '已选功能权限'),
]);

const handleCreate = () => {
  editTarget.roleId = null;
  editTarget.roleName = null;
  editTarget.organId = null;
  editTarget.organName = null;
  editDialogVisible.value = true;
};

const handleEdit = (row: Role) => {
  editTarget.roleId = row.id;
  editTarget.roleName = row.roleName;
  editTarget.organId = row.organId;
  editTarget.organName = row.organName;
  editDialogVisible.value = true;
};

const handleRoleEditSuccess = async () => {
  await loadData();
};

const assignUsersDialog = reactive({
  visible: false,
  roleId: null as number | null,
});

const allUsers = ref<{ value: number; label: string }[]>([]);
const selectedUsers = ref<number[]>([]);
let originalUsers: Set<number> = new Set();

const resetAssignUsersDialog = () => {
  assignUsersDialog.visible = false;
  assignUsersDialog.roleId = null;
  allUsers.value = [];
  selectedUsers.value = [];
  originalUsers.clear();
};

const handleAssignUsers = async (row: Role) => {
  const currentRoleId = row.id;
  assignUsersDialog.roleId = currentRoleId;
  assignUsersDialog.visible = true;

  allUsers.value = (await UserApi.listByRole(currentRoleId)).map((u) => ({
    value: u.id,
    label: u.realName || `${u.id}`,
  }));

  const associatedUsers = (await UserRoleRelationApi.list({
    roleId: currentRoleId,
  })).map((u) => u.userId);
  selectedUsers.value = [...associatedUsers];
  originalUsers = new Set(associatedUsers);
};

const assignUsers = async () => {
  if (!assignUsersDialog.roleId) return;

  const userIds = selectedUsers.value.filter((id) => !originalUsers.has(id));
  const deleteUserIds = [...originalUsers].filter((id) => !selectedUsers.value.includes(id));

  await UserRoleRelationApi.assignUsers({
    roleId: assignUsersDialog.roleId,
    userIds,
    deleteUserIds,
  });

  ElMessage.success(t('MG_ROLE_MSG_ASSIGN_OK', '分配成功'));
  resetAssignUsersDialog();
};

const assignControlUtilsDialog = reactive({
  visible: false,
  roleId: null as number | null,
  organId: null as number | null,
  isDisabled: true,
});

const allControlUtils = ref<{ key: number; label: string; disabled: boolean; description?: string }[]>([]);
const selectedControlUtils = ref<number[]>([]);
let originalControlUtils: Set<number> = new Set();

const resetAssignControlUtilsDialog = () => {
  assignControlUtilsDialog.visible = false;
  assignControlUtilsDialog.roleId = null;
  assignControlUtilsDialog.organId = null;
  assignControlUtilsDialog.isDisabled = true;
  allControlUtils.value = [];
  selectedControlUtils.value = [];
  originalControlUtils.clear();
};

const handleAssignControlUtils = async (row: Role) => {
  const currentRoleId = row.id;
  assignControlUtilsDialog.roleId = currentRoleId;
  assignControlUtilsDialog.organId = row.organId;
  assignControlUtilsDialog.visible = true;

  const disabled = row.roleType === 'ADMIN';
  assignControlUtilsDialog.isDisabled = disabled;

  allControlUtils.value = (await RoleControlUnitRelationApi.listAssignable(row.organId)).map((u) => ({
    key: u.controlUnitId,
    label: u.controlUnitName || `${u.controlUnitId}`,
    disabled,
    description: u.description,
  }));

  const associatedControlUtils = (await RoleControlUnitRelationApi.list({
    roleId: currentRoleId,
  })).map((u) => u.controlUnitId);
  selectedControlUtils.value = [...associatedControlUtils];
  originalControlUtils = new Set(associatedControlUtils);
};

const assignControlUtils = async () => {
  if (!assignControlUtilsDialog.roleId) return;

  const controlUnitIds = selectedControlUtils.value.filter((id) => !originalControlUtils.has(id));
  const deleteControlUnitIds = [...originalControlUtils].filter((id) => !selectedControlUtils.value.includes(id));

  await RoleControlUnitRelationApi.save({
    roleId: assignControlUtilsDialog.roleId,
    controlUnitIds,
    deleteControlUnitIds,
  });

  ElMessage.success(t('MG_ROLE_MSG_CONFIG_OK', '配置成功'));
  resetAssignControlUtilsDialog();
  await loadData();
};

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.role-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.role-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.role-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-page__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.role-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.role-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
