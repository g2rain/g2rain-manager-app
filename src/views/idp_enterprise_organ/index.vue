
<template>
  <div class="idp_enterprise_organ-page">
    <!-- 查询表单 -->
    <el-card class="idp_enterprise_organ-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_IDP_ENT_FIELD_IDP_TYPE', '身份源类型')">
          <el-input
            v-model="queryForm.idpType"
            :placeholder="$t('MG_IDP_ENT_PH_IDP_TYPE', '请输入身份源类型')"
            clearable
            style="width: 200px"
          />
        <!-- 业务特定查询字段 -->
        </el-form-item>
        <el-form-item :label="$t('MG_IDP_ENT_FIELD_ENTERPRISE_ID', 'IDP侧企业ID')">
          <el-input
            v-model="queryForm.enterpriseId"
            :placeholder="$t('MG_IDP_ENT_PH_ENTERPRISE_ID', '请输入IDP侧企业/租户ID')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_IDP_ENT_FIELD_ORGAN_ID', '机构标识')">
          <el-input
            v-model="queryForm.organId"
            :placeholder="$t('MG_IDP_ENT_PH_ORGAN_ID', '请输入机构标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('G2_FIELD_STATUS', '状态')">
          <DictSelect
            v-model="queryForm.status"
            usage-code="STATUS"
            :api-method="DictItemApi.select"
            :placeholder="$t('MG_IDP_ENT_PH_STATUS', '请选择状态')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_IDP_ENT_FIELD_REMARK', '备注')">
          <el-input
            v-model="queryForm.remark"
            :placeholder="$t('MG_IDP_ENT_PH_REMARK', '请输入备注')"
            clearable
            style="width: 200px"
          />
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
    <div class="idp_enterprise_organ-page__header">
      <div class="idp_enterprise_organ-page__title-group">
        <h2>{{ $t('MG_IDP_ENT_TITLE', '管理外部企业数据') }}</h2>
      </div>
      <el-button type="primary" v-permission="'idp_enterprise_organ:add'" @click="handleCreate">
        {{ $t('MG_IDP_ENT_BTN_ADD', '新增外部企业') }}
      </el-button>
    </div>

    <SortableTable
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :enable-multi-sort="true"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="idpType" :label="$t('MG_IDP_ENT_FIELD_IDP_TYPE', '身份源类型')" width="180" />
      <el-table-column prop="enterpriseId" :label="$t('MG_IDP_ENT_COL_ENTERPRISE_ID', '外部企业/租户ID')" width="180" />
      <el-table-column prop="bindMode" :label="$t('MG_IDP_ENT_FIELD_BIND_MODE', '接入形态')" width="140" />
      <el-table-column prop="organId" :label="$t('MG_IDP_ENT_COL_ORGAN_ID', '机构标识，关联 organ.id')" width="140" />
      <el-table-column prop="status" :label="$t('G2_FIELD_STATUS', '状态')" width="180">
        <template #default="{ row: item }">
          <DictText :value="item?.status" usage-code="STATUS" :api-method="DictItemApi.select" />
        </template>
      </el-table-column>
      <el-table-column prop="remark" :label="$t('MG_IDP_ENT_FIELD_REMARK', '备注')" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="400">
        <template #default="{ row }">
          <el-tooltip
            :disabled="isSyncSupported(row)"
            :content="resolveSyncTooltipContent(row)"
          >
            <span>
              <el-dropdown
                v-permission="'idp_enterprise_organ:sync'"
                trigger="click"
                :disabled="!isSyncSupported(row) || syncLoadingId === row.id"
                @visible-change="(visible: boolean) => handleSyncDropdownVisible(visible, row)"
                @command="(roleId: number) => handleSync(row, roleId)"
              >
                <el-button
                  type="warning"
                  link
                  size="small"
                  :loading="syncLoadingId === row.id"
                >
                  {{ $t('MG_IDP_ENT_BTN_SYNC', '同步') }}
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="syncRolesLoadingOrganId === row.organId" disabled>
                      {{ $t('G2_MSG_LOADING', '加载中...') }}
                    </el-dropdown-item>
                    <el-dropdown-item v-else-if="getSyncRoles(row.organId).length === 0" disabled>
                      {{ $t('MG_IDP_ENT_SYNC_NO_ROLES', '该机构暂无角色') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-for="role in getSyncRoles(row.organId)"
                      :key="role.id"
                      :command="role.id"
                    >
                      {{ role.roleName }} ({{ role.roleType }})
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </span>
          </el-tooltip>
          <el-button type="primary" link size="small" @click="handleView(row)">
            {{ $t('G2_BTN_DETAIL', '明细') }}
          </el-button>
          <el-button type="primary" v-permission="'idp_enterprise_organ:edit'" link size="small" @click="handleEdit(row)">
            {{ $t('G2_BTN_EDIT', '编辑') }}
          </el-button>
          <el-button type="danger" v-permission="'idp_enterprise_organ:delete'" link size="small" @click="handleDelete(row)">
            {{ $t('G2_BTN_DELETE', '删除') }}
          </el-button>
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
    <div class="idp_enterprise_organ-page__pagination">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editDialogTitle" width="520px" append-to-body destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item :label="$t('MG_IDP_ENT_FIELD_IDP_TYPE', '身份源类型')" prop="idpType">
          <el-input v-model="editForm.idpType" :placeholder="$t('MG_IDP_ENT_PH_IDP_TYPE', '请输入身份源类型')" />
        </el-form-item>
        <el-form-item :label="$t('MG_IDP_ENT_COL_ENTERPRISE_ID', '外部企业/租户ID')" prop="enterpriseId">
          <el-input v-model="editForm.enterpriseId" :placeholder="$t('MG_IDP_ENT_PH_ENTERPRISE_ID', '请输入外部企业/租户ID')" />
        </el-form-item>
        <el-form-item :label="$t('MG_IDP_ENT_FIELD_BIND_MODE', '接入形态')" prop="bindMode">
          <el-select v-model="editForm.bindMode" :placeholder="$t('MG_IDP_ENT_PH_BIND_MODE', '请选择接入形态')" style="width: 100%">
            <el-option label="INTERNAL" value="INTERNAL" />
            <el-option label="THIRD_PARTY" value="THIRD_PARTY" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('MG_IDP_ENT_COL_ORGAN_ID', '机构标识，关联 organ.id')" prop="organId">
          <el-input v-model="editForm.organId" :placeholder="$t('MG_IDP_ENT_PH_ORGAN_ID_FULL', '请输入机构标识，关联 organ.id')" />
        </el-form-item>
        <el-form-item :label="$t('G2_FIELD_STATUS', '状态')" prop="status">
          <DictSelect
            v-model="editForm.status"
            usage-code="STATUS"
            :api-method="DictItemApi.select"
            :clearable="false"
            :placeholder="$t('MG_IDP_ENT_PH_STATUS', '请选择状态')"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_IDP_ENT_FIELD_REMARK', '备注')" prop="remark">
          <el-input v-model="editForm.remark" :placeholder="$t('MG_IDP_ENT_PH_REMARK', '请输入备注')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-drawer v-model="detailDialogVisible" :title="$t('MG_IDP_ENT_DETAIL', '外部企业明细')" direction="rtl" size="520px" destroy-on-close>
    <!-- 明细抽屉 -->
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_IDP_ENT_FIELD_IDP_TYPE', '身份源类型')">{{ currentRow?.idpType }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_IDP_ENT_COL_ENTERPRISE_ID', '外部企业/租户ID')">{{ currentRow?.enterpriseId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_IDP_ENT_COL_ORGAN_ID', '机构标识，关联 organ.id')">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_STATUS', '状态')">
          <DictText :value="currentRow?.status" usage-code="STATUS" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_IDP_ENT_FIELD_REMARK', '备注')">{{ currentRow?.remark }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-tooltip
          :disabled="canSyncCurrentRow"
          :content="$t('MG_IDP_ENT_SYNC_INTERNAL_ONLY', '首期仅支持企业内部应用（INTERNAL）同步')"
        >
          <span>
            <el-button
              type="warning"
              v-permission="'idp_enterprise_organ:sync'"
              :loading="syncLoading"
              :disabled="!canSyncCurrentRow"
              @click="handleSync"
            >
              {{ $t('MG_IDP_ENT_BTN_SYNC', '同步部门与员工') }}
            </el-button>
          </span>
        </el-tooltip>
        <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { t } from '@platform/i18n';
import { IdpEnterpriseOrganApi } from './api';
import { useTenantIdpSync } from '../tenant_idp_sync/useTenantIdpSync';
import { DictItemApi } from '../dict/api';
import type { IdpEnterpriseOrgan, IdpEnterpriseOrganPayload, IdpEnterpriseOrganQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm, DictSelect, DictText, showErrorMessage } from '@/components';

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询表单（BaseSelectListDto）
let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  idpType: '',
  enterpriseId: '',
  organId: undefined,
  status: '',
  remark: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<IdpEnterpriseOrgan[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as IdpEnterpriseOrganQuery;
  
    // 请求分页数据
    const pageData = await IdpEnterpriseOrganApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & IdpEnterpriseOrganQuery);
      
    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: any) {
    showErrorMessage(error || t('G2_MSG_LOAD_FAIL', '加载列表失败'));
  }
};

// 处理排序变化
const handleSortChange = (params: Record<string, string>) => {
  // 更新 QueryForm 的 sorts 字段
  queryFormRef.value?.updateSorts(params);
};

// 查询
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
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
  queryForm.idpType = '';
  queryForm.enterpriseId = '';
  queryForm.organId = undefined;
  queryForm.status = '';
  queryForm.remark = '';
  
  pagination.pageNum = 1; // 重置到第一页
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1; // 重置到第一页
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<IdpEnterpriseOrgan | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细  
const handleView = (row: IdpEnterpriseOrgan) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: IdpEnterpriseOrgan) => {
  ElMessageBox.confirm(
    t('MG_IDP_ENT_DEL_CONFIRM', `确认删除外部企业「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await IdpEnterpriseOrganApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: any) {
        showErrorMessage(error || t('G2_MSG_DELETE_FAIL', '删除失败'));
      }
    })
    .catch(() => {});
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
  idpType: '',
  enterpriseId: '',
  organId: undefined as number | undefined,
  status: '',
  remark: '',
});

const editDialogTitle = computed(() =>
  isEdit.value ? t('MG_IDP_ENT_DLG_EDIT', '编辑外部企业') : t('MG_IDP_ENT_DLG_ADD', '新增外部企业'),
);

// 表单校验规则
const editRules = computed<FormRules>(() => ({
  idpType: [{ required: true, message: t('MG_IDP_ENT_PH_IDP_TYPE', '请输入身份源类型'), trigger: 'blur' }],
  enterpriseId: [{ required: true, message: t('MG_IDP_ENT_VLD_ENTERPRISE_ID', '请输入外部企业/租户标识'), trigger: 'blur' }],
  organId: [{ required: true, message: t('MG_IDP_ENT_PH_ORGAN_ID_FULL', '请输入机构标识，关联 organ.id'), trigger: 'blur' }],
  status: [{ required: true, message: t('MG_IDP_ENT_PH_STATUS', '请选择状态'), trigger: 'change' }],
}));

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.idpType = '';
  editForm.enterpriseId = '';
  editForm.organId = undefined;
  editForm.status = '';
  editForm.remark = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: IdpEnterpriseOrgan) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.idpType = row.idpType;
  editForm.enterpriseId = row.enterpriseId;
  editForm.organId = row.organId;
  editForm.status = row.status;
  editForm.remark = row.remark;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: IdpEnterpriseOrganPayload = {
    idpType: editForm.idpType,
    enterpriseId: editForm.enterpriseId,
    organId: editForm.organId,
    status: editForm.status,
    remark: editForm.remark,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await IdpEnterpriseOrganApi.save(payload);
    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    showErrorMessage(error || t('G2_MSG_SAVE_FAIL', '保存失败'));
  }
};

// 挂载回调
onMounted(() => {
  // 查询列表
  loadData();
});
</script>

<style scoped>
.idp_enterprise_organ-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.idp_enterprise_organ-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.idp_enterprise_organ-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.idp_enterprise_organ-page__header h2 {
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

.idp_enterprise_organ-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.idp_enterprise_organ-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
