<template>
  <div class="audit_event-page">
    <!-- 查询表单 -->
    <el-card class="audit_event-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_AUDIT_FIELD_TRACE_ID', '链路标识')">
          <el-input
            v-model="queryForm.traceId"
            :placeholder="$t('MG_AUDIT_PH_TRACE_ID', '请输入链路标识')"
            clearable
            style="width: 200px"
          />
        <!-- 业务特定查询字段 -->
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_CLIENT_ID', '客户端标识')">
          <el-input
            v-model="queryForm.clientId"
            :placeholder="$t('MG_AUDIT_PH_CLIENT_ID', '请输入客户端标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_REQUEST_ID', '请求标识')">
          <el-input
            v-model="queryForm.requestId"
            :placeholder="$t('MG_AUDIT_PH_REQUEST_ID', '请输入请求标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_REQUEST_TIME', '请求时间')">
          <el-input
            v-model="queryForm.requestTime"
            :placeholder="$t('MG_AUDIT_PH_REQUEST_TIME', '请输入请求时间')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_PATH', '请求路径')">
          <el-input
            v-model="queryForm.path"
            :placeholder="$t('MG_AUDIT_PH_PATH', '请输入请求路径')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_METHOD', '请求方法')">
          <el-input
            v-model="queryForm.method"
            :placeholder="$t('MG_AUDIT_PH_METHOD', '请输入请求方法')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_PASSPORT_ID', '账号标识')">
          <el-input
            v-model="queryForm.passportId"
            :placeholder="$t('MG_AUDIT_PH_PASSPORT_ID', '请输入账号标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_USER_ID', '用户标识')">
          <el-input
            v-model="queryForm.userId"
            :placeholder="$t('MG_AUDIT_PH_USER_ID', '请输入用户标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('G2_FIELD_REAL_NAME', '真实姓名')">
          <el-input
            v-model="queryForm.name"
            :placeholder="$t('G2_PH_REALNAME', '请输入真实姓名')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_ORGAN_ID', '机构标识')">
          <OrganSelect
            v-model="queryForm.organId"
            :api-method="OrganApi.searchOrgans"
            :placeholder="$t('MG_AUDIT_PH_ORGAN', '请选择机构')"
            width="200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_ORGAN_NAME', '机构名称')">
          <el-input
            v-model="queryForm.organName"
            :placeholder="$t('MG_AUDIT_PH_ORGAN_NAME', '请输入机构名称')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_ORGAN_TYPE', '机构类型')">
          <DictSelect
            v-model="queryForm.organType"
            usage-code="ORGAN_TYPE"
            :api-method="DictItemApi.select"
            clearable
            :placeholder="$t('MG_AUDIT_PH_ORGAN_TYPE', '请选择机构类型')"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_APPLICATION_ID', '应用标识')">
          <el-input
            v-model="queryForm.applicationId"
            :placeholder="$t('MG_AUDIT_PH_APPLICATION_ID', '请输入应用标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_APPLICATION_CODE', '应用编码')">
          <el-input
            v-model="queryForm.applicationCode"
            :placeholder="$t('MG_AUDIT_PH_APPLICATION_CODE', '请输入应用编码')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_AUDIT_FIELD_APP_ORGAN_ID', '应用所属机构标识')">
          <OrganSelect
            v-model="queryForm.applicationOrganId"
            :api-method="OrganApi.searchOrgans"
            :placeholder="$t('MG_AUDIT_PH_APP_ORGAN', '请选择应用所属机构')"
            width="200px"
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
    <div class="audit_event-page__header">
      <div class="audit_event-page__title-group">
        <h2>{{ $t('MG_AUDIT_TITLE', '管理审计日志数据') }}</h2>
      </div>
    </div>

    <SortableTable
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :enable-multi-sort="true"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="id" :label="$t('MG_AUDIT_COL_LOG_ID', '日志标识')" width="120" />
      <el-table-column prop="traceId" :label="$t('MG_AUDIT_FIELD_TRACE_ID', '链路标识')" width="180" />
      <el-table-column prop="clientId" :label="$t('MG_AUDIT_FIELD_CLIENT_ID', '客户端标识')" width="180" />
      <el-table-column prop="requestId" :label="$t('MG_AUDIT_FIELD_REQUEST_ID', '请求标识')" width="180" />
      <el-table-column prop="requestTime" :label="$t('MG_AUDIT_FIELD_REQUEST_TIME', '请求时间')" width="180" />
      <el-table-column prop="path" :label="$t('MG_AUDIT_FIELD_PATH', '请求路径')" width="180" />
      <el-table-column prop="method" :label="$t('MG_AUDIT_FIELD_METHOD', '请求方法')" width="180" />
      <el-table-column prop="passportId" :label="$t('MG_AUDIT_FIELD_PASSPORT_ID', '账号标识')" width="140" />
      <el-table-column prop="userId" :label="$t('MG_AUDIT_FIELD_USER_ID', '用户标识')" width="140" />
      <el-table-column prop="name" :label="$t('G2_FIELD_REAL_NAME', '真实姓名')" width="180" />
      <el-table-column prop="organId" :label="$t('MG_AUDIT_FIELD_ORGAN_ID', '机构标识')" width="140" />
      <el-table-column prop="organName" :label="$t('MG_AUDIT_FIELD_ORGAN_NAME', '机构名称')" width="180" />
      <el-table-column prop="organType" :label="$t('MG_AUDIT_FIELD_ORGAN_TYPE', '机构类型')" width="180">
        <template #default="{ row }">
          <DictText :value="row?.organType" usage-code="ORGAN_TYPE" :api-method="DictItemApi.select" />
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">
            {{ $t('G2_BTN_DETAIL', '明细') }}
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
    <div class="audit_event-page__pagination">
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

    <el-dialog v-model="detailDialogVisible" :title="$t('MG_AUDIT_DETAIL', '审计日志明细')" width="520px">
    <!-- 明细弹窗 -->
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('MG_AUDIT_COL_LOG_ID', '日志标识')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_TRACE_ID', '链路标识')">{{ currentRow?.traceId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_CLIENT_ID', '客户端标识')">{{ currentRow?.clientId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_REQUEST_ID', '请求标识')">{{ currentRow?.requestId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_REQUEST_TIME', '请求时间')">{{ currentRow?.requestTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_ACCEPT_LANGUAGE', '语言偏好')">{{ currentRow?.acceptLanguage }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_PATH', '请求路径')">{{ currentRow?.path }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_METHOD', '请求方法')">{{ currentRow?.method }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_USER_AGENT', '客户端')">{{ currentRow?.userAgent }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_HOST', '请求主机')">{{ currentRow?.host }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_X_FORWARDED_FOR', '代理链 IP 列表')">{{ currentRow?.xForwardedFor }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_X_REAL_IP', '真实客户端 IP')">{{ currentRow?.xRealIp }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_REFERER', '请求来源 URL')">{{ currentRow?.referer }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_SESSION_TYPE', '会话类型')">{{ currentRow?.sessionType }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_PASSPORT_ID', '账号标识')">{{ currentRow?.passportId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_USER_ID', '用户标识')">{{ currentRow?.userId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_REAL_NAME', '真实姓名')">{{ currentRow?.name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_ADMIN_USER', '超级管理员')">{{ currentRow?.adminUser }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_ORGAN_ID', '机构标识')">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_ORGAN_NAME', '机构名称')">{{ currentRow?.organName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_ORGAN_TYPE', '机构类型')">
          <DictText :value="currentRow?.organType" usage-code="ORGAN_TYPE" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_ADMIN_COMPANY', '运营公司')">{{ currentRow?.adminCompany }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_TARGET_ORGAN_ID', '目标机构标识')">{{ currentRow?.targetOrganId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_APPLICATION_ID', '应用标识')">{{ currentRow?.applicationId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_APPLICATION_CODE', '应用编码')">{{ currentRow?.applicationCode }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_APP_ORGAN_ID', '应用所属机构标识')">{{ currentRow?.applicationOrganId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_AUDIT_FIELD_PAYLOAD', '请求载荷')">{{ currentRow?.payload }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { t } from '@platform/i18n';
import { AuditEventApi } from './api';
import { OrganApi } from '../organ/api';
import { DictItemApi } from '../dict/api';
import type { AuditEvent, AuditEventQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, showErrorMessage, OrganSelect, DictSelect, DictText } from '@/components';

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询表单（BaseSelectListDto）
let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务特定查询表单
const queryForm = reactive({
  traceId: '',
  clientId: '',
  requestId: '',
  requestTime: '',
  path: '',
  method: '',
  passportId: undefined,
  userId: undefined,
  name: '',
  organId: undefined,
  organName: '',
  organType: '',
  applicationId: undefined,
  applicationCode: '',
  applicationOrganId: undefined,
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<AuditEvent[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as AuditEventQuery;

    // 请求分页数据
    const pageData = await AuditEventApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & AuditEventQuery);
      
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
  // 查询列表
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
  queryForm.traceId = '';
  queryForm.clientId = '';
  queryForm.requestId = '';
  queryForm.requestTime = '';
  queryForm.path = '';
  queryForm.method = '';
  queryForm.passportId = undefined;
  queryForm.userId = undefined;
  queryForm.name = '';
  queryForm.organId = undefined;
  queryForm.organName = '';
  queryForm.organType = '';
  queryForm.applicationId = undefined;
  queryForm.applicationCode = '';
  queryForm.applicationOrganId = undefined;
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
const currentRow = ref<AuditEvent | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细 
const handleView = (row: AuditEvent) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 挂载回调
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.audit_event-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.audit_event-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.audit_event-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.audit_event-page__header h2 {
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

.audit_event-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.audit_event-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
