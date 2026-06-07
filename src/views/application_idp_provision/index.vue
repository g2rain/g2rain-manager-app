
<template>
  <div class="application_idp_provision-page">
    <!-- 查询表单 -->
    <el-card class="application_idp_provision-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_APP_IDP_FIELD_APPLICATION', '应用')">
        <!-- 业务特定查询字段 -->
          <el-select
            v-model="queryForm.applicationId"
            :placeholder="$t('MG_APP_IDP_PH_APPLICATION', '请选择应用')"
            filterable
            clearable
            style="width: 200px"
          >
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_IDP_TYPE', '身份源类型')">
          <DictSelect v-model="queryForm.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" :placeholder="$t('MG_APP_IDP_PH_IDP_TYPE', '请选择身份源类型')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_IDP_APP_CODE', 'IDP侧应用ID')">
          <el-input v-model="queryForm.idpApplicationCode" :placeholder="$t('MG_APP_IDP_PH_IDP_APP_CODE', '请输入IDP侧应用ID')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_REMARK', '备注')">
          <el-input v-model="queryForm.remark" :placeholder="$t('MG_APP_IDP_PH_REMARK', '请输入备注')" clearable style="width: 200px" />
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
    <div class="application_idp_provision-page__header">
      <div class="application_idp_provision-page__title-group">
        <h2>{{ $t('MG_APP_IDP_TITLE', '管理外部身份源应用与平台应用的绑定数据') }}</h2>
      </div>
      <el-button type="primary" v-permission="'application_idp_provision:add'" @click="handleCreate">{{ $t('MG_APP_IDP_BTN_ADD', '配置应用IDP') }}</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="applicationId" :label="$t('MG_APP_IDP_COL_APP_ID', '应用ID')" width="140" />
      <el-table-column prop="idpType" :label="$t('MG_APP_IDP_FIELD_IDP_TYPE', '身份源类型')" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="idpApplicationCode" :label="$t('MG_APP_IDP_FIELD_IDP_APP_CODE', 'IDP侧应用ID')" width="180" />
      <el-table-column prop="remark" :label="$t('MG_APP_IDP_FIELD_REMARK', '备注')" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'application_idp_provision:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'application_idp_provision:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="application_idp_provision-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="editDialogTitle" width="560px" append-to-body destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item :label="$t('MG_APP_IDP_FIELD_APPLICATION', '应用')" prop="applicationId">
          <el-select
            v-model="editForm.applicationId"
            :placeholder="$t('MG_APP_IDP_PH_APPLICATION', '请选择应用')"
            filterable
            :disabled="isEdit"
            style="width: 100%"
          >
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_IDP_TYPE', '身份源类型')" prop="idpType">
          <DictSelect
            v-model="editForm.idpType"
            usage-code="PASSPORT_IDP_TYPE"
            :api-method="DictItemApi.select"
            :clearable="false"
            :disabled="isEdit"
            :placeholder="$t('MG_APP_IDP_PH_IDP_TYPE', '请选择身份源类型')"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_IDP_APP_CODE', 'IDP侧应用ID')" prop="idpApplicationCode">
          <el-input v-model="editForm.idpApplicationCode" :placeholder="$t('MG_APP_IDP_PH_IDP_APP_CODE', '请输入IDP侧应用ID')" />
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_REMARK', '备注')" prop="remark">
          <el-input v-model="editForm.remark" type="textarea" :rows="3" :placeholder="$t('MG_APP_IDP_PH_REMARK', '请输入备注')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-drawer v-model="detailDialogVisible" :title="$t('MG_APP_IDP_DETAIL', '外部身份源应用与平台应用的绑定明细')" direction="rtl" size="520px" destroy-on-close>
    <!-- 明细抽屉 -->
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_IDP_COL_APP_ID', '应用ID')">{{ currentRow?.applicationId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_IDP_FIELD_IDP_TYPE', '身份源类型')">
          <el-tag>
            <DictText :value="currentRow?.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_IDP_FIELD_IDP_APP_CODE', 'IDP侧应用ID')">{{ currentRow?.idpApplicationCode }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_IDP_FIELD_REMARK', '备注')">{{ currentRow?.remark }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { ApplicationIdpProvisionApi } from './api';
import { ApplicationApi } from '../application/api';
import { DictItemApi } from '../dict/api';
import type { ApplicationIdpProvision, ApplicationIdpProvisionPayload, ApplicationIdpProvisionQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm, DictSelect, DictText, showErrorMessage } from '@/components';

const applicationOptions = ref<Array<{ label: string; value: number }>>([]);

const loadApplicationOptions = async () => {
  try {
    applicationOptions.value = (await ApplicationApi.id2name()).map((item) => ({
      value: item.id,
      label: item.applicationName || String(item.id),
    }));
  } catch (error) {
    console.error('加载应用列表失败:', error);
    applicationOptions.value = [];
  }
// 表单校验规则
};

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
  applicationId: undefined,
  idpType: '',
  idpApplicationCode: '',
  remark: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ApplicationIdpProvision[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ApplicationIdpProvisionQuery;
  
    // 请求分页数据
    const pageData = await ApplicationIdpProvisionApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ApplicationIdpProvisionQuery);
      
    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    showErrorMessage(msg);
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
  queryForm.applicationId = undefined;
  queryForm.idpType = '';
  queryForm.idpApplicationCode = '';
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
const currentRow = ref<ApplicationIdpProvision | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细  
const handleView = (row: ApplicationIdpProvision) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ApplicationIdpProvision) => {
  ElMessageBox.confirm(
    t('MG_APP_IDP_DEL_CONFIRM', `确认删除外部身份源应用与平台应用的绑定「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await ApplicationIdpProvisionApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败');
        showErrorMessage(msg);
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
  applicationId: undefined as number | undefined,
  idpType: '',
  idpApplicationCode: '',
  remark: '',
});

const editDialogTitle = computed(() =>
  isEdit.value ? t('MG_APP_IDP_DLG_EDIT', '编辑应用IDP配置') : t('MG_APP_IDP_DLG_ADD', '配置应用IDP'),
);

const editRules = computed<FormRules>(() => ({
  applicationId: [{ required: true, message: t('MG_APP_IDP_VLD_APPLICATION', '请选择应用'), trigger: 'change' }],
  idpType: [{ required: true, message: t('MG_APP_IDP_VLD_IDP_TYPE', '请选择身份源类型'), trigger: 'change' }],
  idpApplicationCode: [{ required: true, message: t('MG_APP_IDP_VLD_IDP_APP_CODE', '请输入IDP侧应用ID'), trigger: 'blur' }],
}));

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.applicationId = undefined;
  editForm.idpType = '';
  editForm.idpApplicationCode = '';
  editForm.remark = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ApplicationIdpProvision) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.applicationId = row.applicationId;
  editForm.idpType = row.idpType;
  editForm.idpApplicationCode = row.idpApplicationCode;
  editForm.remark = row.remark;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ApplicationIdpProvisionPayload = {
    applicationId: editForm.applicationId,
    idpType: editForm.idpType,
    idpApplicationCode: editForm.idpApplicationCode,
    remark: editForm.remark,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ApplicationIdpProvisionApi.save(payload);
    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    await loadData();
    editDialogVisible.value = false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
    showErrorMessage(msg);
  }
};

// 挂载回调
onMounted(async () => {
  await loadApplicationOptions();
  await loadData();
});
</script>

<style scoped>
.application_idp_provision-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.application_idp_provision-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.application_idp_provision-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.application_idp_provision-page__header h2 {
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

.application_idp_provision-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.application_idp_provision-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
