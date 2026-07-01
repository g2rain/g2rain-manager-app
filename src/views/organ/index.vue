<template>
  <div class="organ-page">
    <!-- 查询表单 -->
    <el-card class="organ-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item :label="$t('MG_ORGAN_FIELD_TYPE', '机构类型')">
          <DictSelect v-model="queryForm.organType" usage-code="ORGAN_TYPE" :api-method="DictItemApi.select" :placeholder="$t('MG_ORGAN_PH_TYPE', '请选择机构类型')" />
        </el-form-item>

        <el-form-item :label="$t('MG_ORGAN_FIELD_NAME', '机构名称')">
          <el-input v-model="queryForm.organName" :placeholder="$t('MG_ORGAN_PH_NAME', '请输入机构名称')" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item :label="$t('MG_ORGAN_FIELD_STATUS', '机构状态')">
          <DictSelect v-model="queryForm.status" usage-code="ORGAN_STATUS" :api-method="DictItemApi.select" :placeholder="$t('MG_ORGAN_PH_STATUS', '请选择机构状态')" />
        </el-form-item>

        <!-- 操作按钮 -->
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="organ-page__header">
      <div class="organ-page__title-group">
        <h2>{{ $t('MG_ORGAN_TITLE', '管理机构数据') }}</h2>
      </div>
      <el-button type="primary" v-permission="'organ:add'" @click="handleCreate">{{ $t('MG_ORGAN_BTN_ADD', '新增机构') }}</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('MG_ORGAN_COL_ID', '机构序号')" width="120" />

      <el-table-column prop="organType" :label="$t('MG_ORGAN_FIELD_TYPE', '机构类型')" width="180">
        <template #default="{ row }">
          <el-tag>
            <DictText :value="row?.organType" usage-code="ORGAN_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="organName" :label="$t('MG_ORGAN_FIELD_NAME', '机构名称')" width="180" />

      <el-table-column prop="status" :label="$t('MG_ORGAN_FIELD_STATUS', '机构状态')" width="180">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            v-permission="'organ:status_update'"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            usage-code="ORGAN_STATUS"
            :api-method="({ nextValue }) => OrganApi.updateStatus(row.id, String(nextValue))"
            @success="loadData"
          />
        </template>
      </el-table-column>

      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />

      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="420">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'organ:edit'" link size="small"
            @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="warning" v-permission="'organ:invite_generate'" link size="small"
            @click="openInviteDialog(row)">{{ $t('MG_ORGAN_BTN_INVITE', '邀请码') }}</el-button>
          <el-button type="success" v-permission="'organ:reassign'" link size="small" v-if="!row.admin"
            @click="handleReassign(row)">{{ $t('MG_ORGAN_BTN_REASSIGN', '调整归属') }}</el-button>
          <el-button type="success" link size="small" v-permission="'organ:idp_enterprise_view'"
            @click="openIdpEnterpriseOrganListDialog(row)">{{ $t('MG_ORGAN_BTN_IDP', '三方企业绑定') }}</el-button>
          <el-button type="danger" v-permission="'organ:delete'" link size="small" v-if="!row.admin"
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

    <!-- 分页组件 -->
    <div class="organ-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editDialogTitle" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item :label="$t('MG_ORGAN_FIELD_TYPE', '机构类型')" prop="organType">
          <DictSelect v-model="editForm.organType" usage-code="ORGAN_TYPE" :disabled="isEdit" :clearable="false" :api-method="DictItemApi.select" :placeholder="$t('MG_ORGAN_PH_TYPE', '请选择机构类型')" />
        </el-form-item>

        <el-form-item :label="$t('MG_ORGAN_FIELD_NAME', '机构名称')" prop="organName">
          <el-input v-model="editForm.organName" :placeholder="$t('MG_ORGAN_PH_NAME', '请输入机构名称')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 明细弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="$t('MG_ORGAN_DETAIL', '机构明细')" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('MG_ORGAN_COL_ID', '机构序号')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_ORGAN_FIELD_TYPE', '机构类型')">
          <el-tag>
            <DictText :value="currentRow?.organType" usage-code="ORGAN_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_ORGAN_FIELD_NAME', '机构名称')">{{ currentRow?.organName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_ORGAN_FIELD_STATUS', '机构状态')">
          <el-tag :type="currentRow?.status === 'ACTIVE' ? 'success' : 'info'">
            <DictText :value="currentRow?.status" usage-code="ORGAN_STATUS" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 调整归属 -->
    <el-dialog v-model="reassignDialog.visible" :title="$t('MG_ORGAN_DLG_REASSIGN', '调整归属')" width="500px">
      <el-form ref="reassignFormRef" :model="reassignDialog" :rules="reassignRules" label-width="120px">
        <el-form-item :label="$t('MG_ORGAN_TREE_SOURCE', '原始上级机构')" prop="sourceParentId">
          <el-tree-select
            v-model="reassignDialog.sourceParentId"
            :data="treeData"
            :placeholder="$t('MG_ORGAN_PH_TREE_SOURCE', '请选择原始上级机构')"
            node-key="organId"
            value-key="organId"
            :props="{ label: 'organName', children: 'subOrgans' }"
            clearable
            filterable
          />
        </el-form-item>

        <el-form-item :label="$t('MG_ORGAN_TREE_TARGET', '目标上级机构')" prop="targetParentId">
          <el-tree-select
            v-model="reassignDialog.targetParentId"
            :data="treeData"
            :placeholder="$t('MG_ORGAN_PH_TREE_TARGET', '请选择目标上级机构')"
            node-key="organId"
            value-key="organId"
            :props="{ label: 'organName', children: 'subOrgans' }"
            clearable
            filterable
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="resetReassignDialog">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" @click="reassign">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-dialog>

    <!-- 生成机构邀请码 -->
    <el-dialog
      v-model="inviteDialog.visible"
      :title="inviteDialogTitle"
      width="520px"
      destroy-on-close
      @closed="resetInviteDialog"
    >
      <el-form label-width="100px">
        <el-form-item :label="$t('MG_ORGAN_INVITE_ROLE', '加入后角色')" required>
          <el-select
            v-model="inviteDialog.roleId"
            :placeholder="$t('MG_ORGAN_PH_ROLE', '请选择角色')"
            filterable
            style="width: 100%"
            :loading="inviteDialog.rolesLoading"
          >
            <el-option
              v-for="role in inviteDialog.roles"
              :key="role.id"
              :label="`${role.roleName} (${role.roleType})`"
              :value="role.id"
            />
          </el-select>
          <div v-if="!inviteDialog.rolesLoading && inviteDialog.roles.length === 0" class="invite-hint">
            {{ $t('MG_ORGAN_INVITE_NO_ROLES', '该机构暂无角色，请先在角色管理中创建。') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('MG_ORGAN_INVITE_VALIDITY', '有效期')">
          <el-radio-group v-model="inviteDialog.validDays">
            <el-radio :value="1">{{ $t('MG_ORGAN_INVITE_24H', '24 小时') }}</el-radio>
            <el-radio :value="7">{{ $t('MG_ORGAN_INVITE_7D', '7 天') }}</el-radio>
            <el-radio :value="30">{{ $t('MG_ORGAN_INVITE_30D', '30 天') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div v-if="inviteDialog.result" class="invite-result">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          :title="$t('MG_ORGAN_INVITE_REGEN_WARN', '重新生成将使此前未使用的邀请码立即失效。')"
          style="margin-bottom: 12px"
        />
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="$t('MG_ORGAN_INVITE_CODE', '邀请码')">
            <span class="invite-code">{{ inviteDialog.result.inviteCode }}</span>
            <el-button type="primary" link size="small" @click="copyInviteCode">{{ $t('MG_ORGAN_BTN_COPY', '复制') }}</el-button>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('MG_ORGAN_INVITE_EXPIRE', '过期时间')">{{ inviteDialog.result.expireAt }}</el-descriptions-item>
          <el-descriptions-item :label="$t('MG_ORGAN_INVITE_ASSIGNED_ROLE', '分配角色')">{{ inviteDialog.result.roleName }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="inviteDialog.visible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        <el-button
          type="primary"
          :loading="inviteDialog.generating"
          :disabled="!inviteDialog.roleId"
          @click="generateInvite"
        >
          {{ $t('MG_ORGAN_BTN_GEN_INVITE', '生成邀请码') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 企业三方授权绑定列表 -->
    <el-drawer
      v-model="idpEnterpriseOrganListDrawerVisible"
      :title="idpDrawerTitle"
      direction="rtl"
      size="720px"
      destroy-on-close
      @closed="idpEnterpriseOrganListRows = []"
    >
      <el-table :data="idpEnterpriseOrganListRows" border stripe style="width: 100%">
        <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="80" />
        <el-table-column prop="idpType" :label="$t('MG_ORGAN_COL_IDP_TYPE', '身份源类型')" width="120">
          <template #default="{ row: item }">
            <el-tag effect="light" size="small">
              <DictText :value="item?.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" />
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseId" :label="$t('MG_ORGAN_COL_ENTERPRISE_ID', '外部企业/租户ID')" min-width="160" />
        <el-table-column prop="status" :label="$t('G2_FIELD_STATUS', '状态')" width="100">
          <template #default="{ row: item }">
            <el-tag effect="light" size="small">
              <DictText :value="item?.status" usage-code="STATUS" :api-method="DictItemApi.select" />
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" :label="$t('MG_ORGAN_COL_REMARK', '备注')" min-width="140" show-overflow-tooltip />
        <el-table-column prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="170" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="idpEnterpriseOrganListDrawerVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { FormInstance, FormRules, FormItemRule } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { OrganApi } from './api';
import { OrganInviteApi } from './invite.api';
import type { OrganInviteVo } from './invite.api';
import { RoleApi } from '../role/api';
import type { Role } from '../role/type';
import { DictItemApi } from '../dict/api';
import { IdpEnterpriseOrganApi } from '../idp_enterprise_organ/api';
import type { Organ, OrganPayload, OrganQuery, OrganHierarchicalRelation } from './type';
import type { IdpEnterpriseOrgan } from '../idp_enterprise_organ/type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, DictSelect, DictText, StatusSwitch } from '@/components';

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询状态（使用 reactive v-model 替换整个对象时保持响应式）
let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  organType: '',
  organName: '',
  status: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<Organ[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as OrganQuery;

    // 请求分页数据
    const pageData = await OrganApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & OrganQuery);

    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    ElMessage.error(msg);
  }
};

// 处理排序字段
const handleSortChange = (params: Record<string, string>) => {
  // 更新 QueryForm 的 sorts 字段
  queryFormRef.value?.updateSorts(params);
};

// 查询数据列表
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 重置查询条件
const handleReset = () => {
  // 重置基础查询表单
  baseQueryForm.id = undefined;
  baseQueryForm.createTime = undefined;
  baseQueryForm.updateTime = undefined;
  baseQueryForm.sorts = undefined;
  // 重置业务特定查询表单
  queryForm.organType = '';
  queryForm.organName = '';
  queryForm.status = '';
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<Organ | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: Organ) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: Organ) => {
  ElMessageBox.confirm(
    t('MG_ORGAN_DEL_CONFIRM', `确认删除机构「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await OrganApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
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

// 保存弹窗引用
const editDialogVisible = ref(false);

// 修改标记状态
const isEdit = ref(false);

// 修改组件引用
const editFormRef = ref<FormInstance | null>(null);

// 保存表单状态
const editForm = reactive({
  id: undefined as number | undefined,
  organType: '',
  organName: '',
});

const editDialogTitle = computed(() =>
  isEdit.value ? t('MG_ORGAN_DLG_EDIT', '编辑机构') : t('MG_ORGAN_DLG_ADD', '新增机构'),
);

const editRules = computed<FormRules>(() => ({
  organType: [{ required: true, message: t('G2_VLD_REQ_ORG_TYPE', '请选择机构类型'), trigger: 'blur' }],
  organName: [{ required: true, message: t('G2_VLD_REQ_ORG_NAME', '请输入机构名称'), trigger: 'blur' }],
}));

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.organType = '';
  editForm.organName = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗  
const handleEdit = (row: Organ) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organType = row.organType;
  editForm.organName = row.organName;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: OrganPayload = {
    organType: editForm.organType,
    organName: editForm.organName,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await OrganApi.save(payload);
    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    await loadData();
    editDialogVisible.value = false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
    ElMessage.error(msg);
  }
};

// 调整归属组件引用
const reassignFormRef = ref<FormInstance>();
const treeData = ref<OrganHierarchicalRelation[]>([]);

// 调整归属弹窗引用
const reassignDialog = reactive({
  visible: false,
  organId: null as number | null,
  sourceParentId: null as number | null,
  targetParentId: null as number | null
})

const reassignRules = computed<Record<string, FormItemRule[]>>(() => ({
// 关键：联动校验规则
  sourceParentId: [
    {
      validator: (_, value, callback) => {
        if (!value && !reassignDialog.targetParentId) {
          callback(new Error(t('MG_ORGAN_VLD_REASSIGN', '原始或目标上级机构至少选择一个')));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
  targetParentId: [
    {
      validator: (_, value, callback) => {
        if (!value && !reassignDialog.sourceParentId) {
          callback(new Error(t('MG_ORGAN_VLD_REASSIGN', '原始或目标上级机构至少选择一个')));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
}));

// 重置调整归属弹窗引用
const resetReassignDialog = () => {
  // 统一重置弹窗状态，清空数据
  reassignDialog.visible = false;
  reassignDialog.organId = null;
  reassignDialog.sourceParentId = null;
  reassignDialog.targetParentId = null;
}

// 查看企业三方授权绑定列表
const idpEnterpriseOrganListDrawerVisible = ref(false);
const idpEnterpriseOrganListRows = ref<IdpEnterpriseOrgan[]>([]);
const currentOrganName = ref('');

const openIdpEnterpriseOrganListDialog = async (row: Organ) => {
  currentOrganName.value = row.organName;
  idpEnterpriseOrganListDrawerVisible.value = true;
  idpEnterpriseOrganListRows.value = [];
  try {
    idpEnterpriseOrganListRows.value = await IdpEnterpriseOrganApi.list({ organId: row.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('MG_ORGAN_MSG_IDP_LOAD_FAIL', '加载企业三方授权绑定失败');
    ElMessage.error(msg);
  }
};

// 打开调整归属弹窗
const handleReassign = async (row: Organ) => {
  reassignFormRef.value?.clearValidate();

  const currentOrganId = row.id;
  reassignDialog.organId = currentOrganId;
  reassignDialog.visible = true;
  // 赋值给树组件
  treeData.value = (await OrganApi.getHierarchicalRelations());
};

// 提交调整归属数据
const reassign = async () => {
  await reassignFormRef.value?.validate();

  const { organId, sourceParentId, targetParentId } = reassignDialog;
  if (!organId) {
    return
  }

  // 2. 构造符合 OrganClosure 接口的对象
  await OrganApi.adjustHierarchy(organId, {
    sourceAncestorId: sourceParentId || undefined,
    targetAncestorId: targetParentId || undefined
  });
  ElMessage.success(t('MG_ORGAN_MSG_REASSIGN_OK', '分配成功'));
  resetReassignDialog();
};

// 邀请码弹窗
const inviteDialog = reactive({
  visible: false,
  organId: null as number | null,
  organName: '' as string,
  roleId: null as number | null,
  validDays: 7,
  roles: [] as Role[],
  rolesLoading: false,
  generating: false,
  result: null as OrganInviteVo | null,
});

const inviteDialogTitle = computed(() =>
  t('MG_ORGAN_DLG_INVITE_TITLE', `机构邀请码 — ${inviteDialog.organName ?? ''}`),
);

const idpDrawerTitle = computed(() =>
  t('MG_ORGAN_DLG_IDP_TITLE', `企业三方授权绑定（机构 ${currentOrganName.value ?? ''}）`),
);

const resetInviteDialog = () => {
  inviteDialog.organId = null;
  inviteDialog.organName = '';
  inviteDialog.roleId = null;
  inviteDialog.validDays = 7;
  inviteDialog.roles = [];
  inviteDialog.result = null;
};

const openInviteDialog = async (row: Organ) => {
  inviteDialog.organId = row.id;
  inviteDialog.organName = row.organName;
  inviteDialog.roleId = null;
  inviteDialog.validDays = 7;
  inviteDialog.result = null;
  inviteDialog.visible = true;
  inviteDialog.rolesLoading = true;
  try {
    inviteDialog.roles = await RoleApi.list({ organId: row.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('MG_ORGAN_MSG_ROLES_FAIL', '加载角色列表失败');
    ElMessage.error(msg);
    inviteDialog.roles = [];
  } finally {
    inviteDialog.rolesLoading = false;
  }
};

const generateInvite = async () => {
  if (!inviteDialog.organId || !inviteDialog.roleId) return;
  inviteDialog.generating = true;
  try {
    inviteDialog.result = await OrganInviteApi.generate({
      organId: inviteDialog.organId,
      roleId: inviteDialog.roleId,
      validDays: inviteDialog.validDays,
    });
    ElMessage.success(t('MG_ORGAN_MSG_INVITE_OK', '邀请码已生成'));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('MG_ORGAN_MSG_INVITE_FAIL', '生成邀请码失败');
    ElMessage.error(msg);
  } finally {
    inviteDialog.generating = false;
  }
};

const copyInviteCode = async () => {
  const code = inviteDialog.result?.inviteCode;
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    ElMessage.success(t('MG_ORGAN_MSG_COPY_OK', '已复制到剪贴板'));
  } catch {
    ElMessage.error(t('MG_ORGAN_MSG_COPY_FAIL', '复制失败，请手动复制'));
  }
};

// 挂载回调
onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.organ-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.organ-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.organ-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.organ-page__header h2 {
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

.organ-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.organ-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.invite-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.invite-result {
  margin-top: 8px;
}

.invite-code {
  font-family: monospace;
  font-size: 14px;
  word-break: break-all;
}
</style>
