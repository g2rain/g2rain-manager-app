<template>
  <div class="application-authorization-page">
    <!-- 查询表单 -->
    <el-card class="application-authorization-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_FIELD_ORGAN', '所属机构')">
          <OrganSelect v-model="queryForm.organId" :api-method="OrganApi.searchOrgans" :placeholder="$t('MG_PH_ORGAN', '请选择所属机构')" width="200px" />
        <!-- 业务特定查询字段 -->
        </el-form-item>

        <el-form-item :label="$t('MG_APP_AUTH_FIELD_APPLICATION', '所属应用')">
          <el-select v-model="queryForm.applicationId" :placeholder="$t('MG_APP_AUTH_PH_APPLICATION', '请选择所属应用')" clearable style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('MG_APP_AUTH_FIELD_SUBSCRIPTION', '订阅序号')">
          <el-input v-model="queryForm.subscriptionId" :placeholder="$t('MG_APP_AUTH_PH_SUBSCRIPTION', '请输入订阅序号')" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item :label="$t('G2_FIELD_STATUS', '状态')">
          <DictSelect v-model="queryForm.status" usage-code="AUTHORIZATION_STATUS" :api-method="DictItemApi.select" :placeholder="$t('MG_APP_AUTH_PH_STATUS', '请选择状态')" />
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
    <div class="application-authorization-page__header">
      <div class="application-authorization-page__title-group">
        <h2>{{ $t('MG_APP_AUTH_TITLE', '管理应用授权数据') }}</h2>
      </div>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('MG_APP_AUTH_COL_ID', '应用授权序号')" width="120" />
      <el-table-column prop="organName" :label="$t('MG_FIELD_ORGAN', '所属机构')" width="140" />
      <el-table-column prop="applicationName" :label="$t('MG_APP_AUTH_FIELD_APPLICATION', '所属应用')" width="140" />
      <el-table-column prop="controlDomainName" :label="$t('MG_APP_AUTH_COL_CAPABILITY', '业务能力名称')" width="160">
        <template #default="{ row }">
          <!-- placement="top" 让提示框出现在上方 -->
          <!-- show-after="300" 增加一点延迟，防止鼠标快速滑过时频繁闪烁，显得更有质感 -->
          <el-tooltip effect="dark" placement="top" :content="row.controlDomainDesc" :disabled="!row.controlDomainDesc">
            <span class="capability-tag">{{ row.controlDomainName }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('G2_FIELD_STATUS', '状态')" width="180">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            v-permission="'application_authorization:status_update'"
            active-value="ACTIVATED"
            inactive-value="DEACTIVATED"
            usage-code="AUTHORIZATION_STATUS"
            :api-method="({ nextValue }) => ApplicationAuthorizationApi.updateStatus(row.id, String(nextValue))"
            @success="loadData"
          />
        </template>
      </el-table-column>
      <el-table-column prop="subscriptionId" :label="$t('MG_APP_AUTH_FIELD_SUBSCRIPTION', '订阅序号')" width="140" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="warning" v-permission="'application_authorization:control_utils_sync'" link size="small" @click="updateSyncControlUtils(row)">{{ $t('MG_APP_AUTH_BTN_SYNC', '同步能力') }}</el-button>
          <el-button v-if="row.apiKeySupported" type="primary"  v-permission="'application_authorization:manager_api_keys'" link size="small" @click="openApiKeyManager(row)">{{ $t('MG_APP_AUTH_BTN_API_KEY', '模型秘钥管理') }}</el-button>
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
    <div class="application-authorization-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <el-dialog v-model="apiKeyManagerVisible" :title="$t('MG_APP_AUTH_DLG_API_KEY', '模型秘钥管理')" width="1120px">
      <PersonalStaticAccessToken :application-authorization="currentAuthorization" embedded />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { ApplicationAuthorizationApi } from './api';
import { OrganApi } from '../organ/api';
import { ApplicationApi } from '../application/api';
import { DictItemApi } from '../dict/api';
import type { ApplicationAuthorization, ApplicationAuthorizationQuery } from './type';
import type { PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, OrganSelect, DictSelect, StatusSwitch, type QueryFormData } from '@/components';
import PersonalStaticAccessToken from '../personal_static_access_token/index.vue';

// 定义字典引用
const applicationOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取字典信息
const loadDicts = async () => {
  applicationOptions.value = (await ApplicationApi.id2name()).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));
};

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询状态（使用 reactive v-model 替换整个对象时保持响应式）
let baseQueryForm = reactive<QueryFormData>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  organId: undefined,
  applicationId: undefined,
  subscriptionId: undefined,
  status: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ApplicationAuthorization[]>([]);
const currentAuthorization = ref<ApplicationAuthorization | null>(null);
const apiKeyManagerVisible = ref(false);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ApplicationAuthorizationQuery;

    // 请求分页数据
    const pageData = await ApplicationAuthorizationApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ApplicationAuthorizationQuery);

    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    ElMessage.error(msg);
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
  queryForm.organId = undefined;
  queryForm.applicationId = undefined;
  queryForm.subscriptionId = undefined;
  queryForm.status = '';
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

// 同步能力
const updateSyncControlUtils = async (row: ApplicationAuthorization) => {
  await ApplicationAuthorizationApi.save({
    organId: row.organId,
    applicationId: row.applicationId,
    controlDomainId: row.controlDomainId
  })

  ElMessage.success(t('MG_APP_AUTH_MSG_SYNC_OK', '同步成功'))
};

const openApiKeyManager = (row: ApplicationAuthorization) => {
  currentAuthorization.value = { ...row };
  apiKeyManagerVisible.value = true;
};

// 挂载回调
onMounted(async () => {
  // 先准备字典
  await loadDicts();
  // 再查询列表
  await loadData();
});
</script>

<style scoped>
/* 增加一点视觉提示，让用户知道这里可以“搭”鼠标 */
.capability-tag {
  cursor: help;
  cursor: help; /* 鼠标样式变为带问号的指针 */
  color: var(--el-color-primary);
  border-bottom: 1px dashed var(--el-color-primary-light-3);
  padding-bottom: 2px;
}

.application-authorization-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.application-authorization-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.application-authorization-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.application-authorization-page__header h2 {
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

.application-authorization-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.application-authorization-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
