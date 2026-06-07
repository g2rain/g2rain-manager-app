
<template>
  <div class="passport_idp_binding-page">
    <!-- 查询表单 -->
    <el-card class="passport_idp_binding-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_PP_IDP_FIELD_PASSPORT_ID', '账号标识')">
          <el-input v-model="queryForm.passportId" :placeholder="$t('MG_PP_IDP_PH_PASSPORT_ID', '请输入账号标识')" clearable style="width: 200px" />
        <!-- 业务特定查询字段 -->
        </el-form-item>
        <el-form-item :label="$t('MG_PP_IDP_FIELD_IDP_TYPE', '身份源类型')">
          <DictSelect v-model="queryForm.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" :placeholder="$t('MG_PP_IDP_PH_IDP_TYPE', '请选择身份源类型')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MG_PP_IDP_FIELD_IDP_SUBJECT', 'IDP侧用户授权标识')">
          <el-input v-model="queryForm.idpSubject" :placeholder="$t('MG_PP_IDP_PH_IDP_SUBJECT', '请输入IDP侧用户授权标识')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MG_PP_IDP_FIELD_CORP_ID', 'IDP侧企业ID')">
          <el-input v-model="queryForm.corpId" :placeholder="$t('MG_PP_IDP_PH_CORP_ID', '请输入IDP侧企业ID')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MG_PP_IDP_FIELD_IDP_USER_ID', 'IDP侧用户ID')">
          <el-input v-model="queryForm.idpUserId" :placeholder="$t('MG_PP_IDP_PH_IDP_USER_ID', '请输入IDP侧用户ID')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MG_PP_IDP_FIELD_IDP_APP_CODE', 'IDP侧的应用ID')">
          <el-input v-model="queryForm.idpApplicationCode" :placeholder="$t('MG_PP_IDP_PH_IDP_APP_CODE', '请输入IDP侧的应用ID')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MG_PP_IDP_FIELD_BIND_MODE', '接入形态')">
          <el-input v-model="queryForm.bindMode" :placeholder="$t('MG_PP_IDP_PH_BIND_MODE', '请输入接入形态')" clearable style="width: 200px" />
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

    <!-- 标题 -->
    <div class="passport_idp_binding-page__header">
      <div class="passport_idp_binding-page__title-group">
        <h2>{{ $t('MG_PP_IDP_TITLE', '管理账号与外部身份源绑定表数据') }}</h2>
      </div>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="passportId" :label="$t('MG_PP_IDP_FIELD_PASSPORT_ID', '账号标识')" width="140" />
      <el-table-column prop="idpType" :label="$t('MG_PP_IDP_FIELD_IDP_TYPE', '身份源类型')" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="idpSubject" :label="$t('MG_PP_IDP_FIELD_IDP_SUBJECT', 'IDP侧用户授权标识')" width="180" />
      <el-table-column prop="corpId" :label="$t('MG_PP_IDP_FIELD_CORP_ID', 'IDP侧企业ID')" width="180" />
      <el-table-column prop="idpUserId" :label="$t('MG_PP_IDP_FIELD_IDP_USER_ID', 'IDP侧用户ID')" width="180" />
      <el-table-column prop="idpApplicationCode" :label="$t('MG_PP_IDP_FIELD_IDP_APP_CODE', 'IDP侧的应用ID')" width="180" />
      <el-table-column prop="bindMode" :label="$t('MG_PP_IDP_FIELD_BIND_MODE', '接入形态')" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="160">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="danger" v-permission="'passport_idp_binding:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="passport_idp_binding-page__pagination">
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

    <el-drawer v-model="detailDialogVisible" :title="$t('MG_PP_IDP_DETAIL', '账号与外部身份源绑定表明细')" direction="rtl" size="720px" destroy-on-close>
    <!-- 明细抽屉 -->
      <el-descriptions :column="1" border label-width="220px" class="passport-idp-binding-detail">
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_PP_IDP_FIELD_PASSPORT_ID', '账号标识')">{{ currentRow?.passportId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_PP_IDP_FIELD_IDP_TYPE', '身份源类型')">
          <el-tag>
            <DictText :value="currentRow?.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_PP_IDP_FIELD_IDP_SUBJECT', 'IDP侧用户授权标识')">{{ currentRow?.idpSubject }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_PP_IDP_FIELD_CORP_ID', 'IDP侧企业ID')">{{ currentRow?.corpId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_PP_IDP_FIELD_IDP_USER_ID', 'IDP侧用户ID')">{{ currentRow?.idpUserId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_PP_IDP_FIELD_IDP_APP_CODE', 'IDP侧的应用ID')">{{ currentRow?.idpApplicationCode }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_PP_IDP_FIELD_BIND_MODE', '接入形态')">{{ currentRow?.bindMode }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_PP_IDP_FIELD_RAW_PROFILE', 'IdP 返回的原始用户信息快照')">
          <span class="passport-idp-binding-detail__content">{{ currentRow?.rawProfile }}</span>
        </el-descriptions-item>
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { PassportIdpBindingApi } from './api';
import { DictItemApi } from '../dict/api';
import type { PassportIdpBinding, PassportIdpBindingQuery } from './type';
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
  passportId: undefined,
  idpType: '',
  idpSubject: '',
  corpId: '',
  idpUserId: '',
  idpApplicationCode: '',
  bindMode: '',
  rawProfile: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<PassportIdpBinding[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as PassportIdpBindingQuery;
  
    // 请求分页数据
    const pageData = await PassportIdpBindingApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & PassportIdpBindingQuery);
      
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
  queryForm.passportId = undefined;
  queryForm.idpType = '';
  queryForm.idpSubject = '';
  queryForm.corpId = '';
  queryForm.idpUserId = '';
  queryForm.idpApplicationCode = '';
  queryForm.bindMode = '';
  queryForm.rawProfile = '';
  
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
const currentRow = ref<PassportIdpBinding | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细  
const handleView = (row: PassportIdpBinding) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: PassportIdpBinding) => {
  ElMessageBox.confirm(
    t('MG_PP_IDP_DEL_CONFIRM', `确认删除账号与外部身份源绑定表「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await PassportIdpBindingApi.remove(row.id);
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

// 挂载回调
onMounted(() => {
  // 查询列表
  loadData();
});
</script>

<style scoped>
.passport_idp_binding-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.passport_idp_binding-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.passport_idp_binding-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.passport_idp_binding-page__header h2 {
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

.passport_idp_binding-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.passport_idp_binding-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.passport-idp-binding-detail :deep(.el-descriptions__label) {
  white-space: nowrap;
  vertical-align: top;
}

.passport-idp-binding-detail :deep(.el-descriptions__content) {
  word-break: break-all;
}

.passport-idp-binding-detail__content {
  display: inline-block;
  max-width: 100%;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
