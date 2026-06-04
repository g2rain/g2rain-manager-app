<template>
  <div class="login_token-page">
    <!-- 查询表单 -->
    <el-card class="login_token-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_LOGIN_TOKEN_FIELD_SESSION_TYPE', '会话类型')">
          <DictSelect
            v-model="queryForm.sessionType"
            usage-code="SESSION_TYPE"
            :api-method="DictItemApi.select"
            :placeholder="$t('MG_LOGIN_TOKEN_PH_SESSION_TYPE', '请选择会话类型')"
          />
        <!-- 业务特定查询字段 -->
        </el-form-item>
        <el-form-item :label="$t('MG_LOGIN_TOKEN_FIELD_ORGAN_ID', '机构标识')">
          <OrganSelect
            v-model="queryForm.organId"
            :api-method="OrganApi.searchOrgans"
            :placeholder="$t('MG_LOGIN_TOKEN_PH_ORGAN', '请选择机构')"
            width="200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_LOGIN_TOKEN_FIELD_ORGAN_TYPE', '机构类型')">
          <DictSelect
            v-model="queryForm.organType"
            usage-code="ORGAN_TYPE"
            :api-method="DictItemApi.select"
            :placeholder="$t('MG_LOGIN_TOKEN_PH_ORGAN_TYPE', '请选择机构类型')"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_LOGIN_TOKEN_FIELD_PASSPORT_ID', '账号标识')">
          <el-input
            v-model="queryForm.passportId"
            :placeholder="$t('MG_LOGIN_TOKEN_PH_PASSPORT_ID', '请输入账号标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_LOGIN_TOKEN_FIELD_USER_ID', '用户标识')">
          <el-input
            v-model="queryForm.userId"
            :placeholder="$t('MG_LOGIN_TOKEN_PH_USER_ID', '请输入用户标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('G2_FIELD_REAL_NAME', '真实姓名')">
          <el-input
            v-model="queryForm.realName"
            :placeholder="$t('G2_PH_REALNAME', '请输入真实姓名')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_LOGIN_TOKEN_FIELD_APPLICATION_ID', '应用标识')">
          <el-input
            v-model="queryForm.applicationId"
            :placeholder="$t('MG_LOGIN_TOKEN_PH_APPLICATION_ID', '请输入应用标识')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_LOGIN_TOKEN_FIELD_APP_ORGAN_ID', '应用所属机构标识')">
          <OrganSelect
            v-model="queryForm.applicationOrganId"
            :api-method="OrganApi.searchOrgans"
            :placeholder="$t('MG_LOGIN_TOKEN_PH_APP_ORGAN', '请选择应用所属机构')"
            width="200px"
          />
        </el-form-item>
        <el-form-item :label="$t('MG_LOGIN_TOKEN_FIELD_CLIENT_ID', '客户端标识')">
          <el-input
            v-model="queryForm.clientId"
            :placeholder="$t('MG_LOGIN_TOKEN_PH_CLIENT_ID', '请输入客户端标识')"
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
    <div class="login_token-page__header">
      <div class="login_token-page__title-group">
        <h2>{{ $t('MG_LOGIN_TOKEN_TITLE', '管理登陆日志数据') }}</h2>
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
      <el-table-column prop="clientId" :label="$t('MG_LOGIN_TOKEN_FIELD_CLIENT_ID', '客户端标识')" width="180" />
      <el-table-column prop="applicationId" :label="$t('MG_LOGIN_TOKEN_FIELD_APPLICATION_ID', '应用标识')" width="140" />
      <el-table-column
        prop="applicationOrganId"
        :label="$t('MG_LOGIN_TOKEN_FIELD_APP_ORGAN_ID', '应用所属机构标识')"
        width="140"
      />
      <el-table-column prop="sessionType" :label="$t('MG_LOGIN_TOKEN_FIELD_SESSION_TYPE', '会话类型')" width="180">
        <template #default="{ row }">
          <DictText :value="row?.sessionType" usage-code="SESSION_TYPE" :api-method="DictItemApi.select" />
        </template>
      </el-table-column>
      <el-table-column prop="passportId" :label="$t('MG_LOGIN_TOKEN_FIELD_PASSPORT_ID', '账号标识')" width="140" />
      <el-table-column prop="userId" :label="$t('MG_LOGIN_TOKEN_FIELD_USER_ID', '用户标识')" width="140" />
      <el-table-column prop="realName" :label="$t('G2_FIELD_REAL_NAME', '真实姓名')" width="180" />
      <el-table-column prop="organId" :label="$t('MG_LOGIN_TOKEN_FIELD_ORGAN_ID', '机构标识')" width="140" />
      <el-table-column prop="organType" :label="$t('MG_LOGIN_TOKEN_FIELD_ORGAN_TYPE', '机构类型')" width="180">
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
    <div class="login_token-page__pagination">
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

    <el-dialog v-model="detailDialogVisible" :title="$t('MG_LOGIN_TOKEN_DETAIL', '登陆日志明细')" width="520px">
    <!-- 明细弹窗 -->
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_COL_LOG_ID', '日志标识')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_CLIENT_ID', '客户端标识')">{{ currentRow?.clientId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_APPLICATION_ID', '应用标识')">{{ currentRow?.applicationId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_APP_ORGAN_ID', '应用所属机构标识')">{{ currentRow?.applicationOrganId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_SESSION_TYPE', '会话类型')">
          <DictText :value="currentRow?.sessionType" usage-code="SESSION_TYPE" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_PASSPORT_ID', '账号标识')">{{ currentRow?.passportId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_USER_ID', '用户标识')">{{ currentRow?.userId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_REAL_NAME', '真实姓名')">{{ currentRow?.realName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_ADMIN_USER', '超级管理员')">{{ currentRow?.adminUser }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_ORGAN_ID', '机构标识')">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_ORGAN_TYPE', '机构类型')">
          <DictText :value="currentRow?.organType" usage-code="ORGAN_TYPE" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_LOGIN_TOKEN_FIELD_ADMIN_COMPANY', '运营公司')">{{ currentRow?.adminCompany }}</el-descriptions-item>
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
import { LoginTokenApi } from './api';
import { OrganApi } from '../organ/api';
import { DictItemApi } from '../dict/api';
import type { LoginToken, LoginTokenQuery } from './type';
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
  sessionType: '',
  organId: undefined,
  organType: '',
  passportId: undefined,
  userId: undefined,
  realName: '',
  applicationId: undefined,
  applicationOrganId: undefined,
  clientId: undefined,
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<LoginToken[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
      // 合并基础查询 + 业务查询，并过滤空值
      const query = Object.fromEntries(
        Object.entries({ ...baseQueryForm, ...queryForm })
          .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
      ) as LoginTokenQuery;

      // 请求分页数据
      const pageData = await LoginTokenApi.page({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        ...query,
      } as PageSelectListDto & LoginTokenQuery);
      
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
  queryForm.sessionType = '';
  queryForm.organId = undefined;
  queryForm.organType = '';
  queryForm.passportId = undefined;
  queryForm.userId = undefined;
  queryForm.realName = '';
  queryForm.applicationId = undefined;
  queryForm.applicationOrganId = undefined;
  queryForm.clientId = undefined;
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

// 调整页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<LoginToken | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细 
const handleView = (row: LoginToken) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 挂载回调
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.login_token-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.login_token-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.login_token-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login_token-page__header h2 {
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

.login_token-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.login_token-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
