<template>
  <div class="application-authorization-page">
    <!-- 查询表单 -->
    <el-card class="application-authorization-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="所属机构">
          <el-select v-model="queryForm.organId" placeholder="请选择所属机构" clearable style="width: 200px">
            <el-option v-for="item in organOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属应用">
          <el-select v-model="queryForm.applicationId" placeholder="请选择所属应用" clearable style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="订阅序号">
          <el-input v-model="queryForm.subscriptionId" placeholder="请输入订阅序号" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 200px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <!-- 操作按钮 -->
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="application-authorization-page__header">
      <div class="application-authorization-page__title-group">
        <h2>管理应用授权数据</h2>
      </div>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" label="应用授权序号" width="120" />
      <el-table-column prop="organId" label="所属机构" width="140" />
      <el-table-column prop="applicationId" label="所属应用" width="140" />
      <el-table-column prop="controlDomainName" label="业务能力名称" width="160">
        <template #default="{ row }">
          <!-- placement="top" 让提示框出现在上方 -->
          <!-- show-after="300" 增加一点延迟，防止鼠标快速滑过时频繁闪烁，显得更有质感 -->
          <el-tooltip effect="dark" placement="top" :content="row.controlDomainDesc" :disabled="!row.controlDomainDesc">
            <span class="capability-tag">{{ row.controlDomainName }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="180">
        <template #default="{ row }">
          <el-switch
            v-permission="'application_authorization:status_update'"
            v-model="row.status"
            inline-prompt
            :active-value="'ACTIVATED'"
            :inactive-value="'DEACTIVATED'"
            :active-text="statusOptions.find(item => item.value === 'ACTIVATED')?.label"
            :inactive-text="statusOptions.find(item => item.value === 'DEACTIVATED')?.label"
            @change="updateStatus(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="subscriptionId" label="订阅序号" width="140" />
      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />
      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />
      <el-table-column label="操作" fixed="right" width="100">
        <template #default="{ row }">
          <el-button type="warning" v-permission="'application_authorization:control_utils_sync'" link size="small"
            @click="updateSyncControlUtils(row)">同步能力</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>操作</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { ApplicationAuthorizationApi } from './api';
import { OrganApi } from '../organ/api';
import { ApplicationApi } from '../application/api';
import type { ApplicationAuthorization, ApplicationAuthorizationQuery } from './type';
import type { PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, type QueryFormData } from '@/components';

// 定义字典引用
const statusOptions = ref<Array<{ label: string; value: string }>>([]);
const organOptions = ref<Array<{ label: string; value: number }>>([]);
const applicationOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取字典信息
const loadDicts = async () => {
  applicationOptions.value = (await ApplicationApi.id2name()).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));
  organOptions.value = (await OrganApi.searchOrgans()).map(u => ({
    value: u.organId,
    label: u.organName
  }));

  statusOptions.value = [{
    label: '激活',
    value: 'ACTIVATED'
  }, {
    label: '关停',
    value: 'DEACTIVATED'
  }];
};

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询状态（使用 reactive v-model 替换整个对象时保持响应式）
const baseQueryForm = reactive<QueryFormData>({
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
  } catch (error: any) {
    ElMessage.error(error.message || '加载列表失败');
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

// 修改应用状态
const updateStatus = async (row: ApplicationAuthorization) => {
  const prevStatus = row.status === 'ACTIVATED' ? 'DEACTIVATED' : 'ACTIVATED';
  try {
    await ApplicationAuthorizationApi.updateStatus(row.id, row.status);
    ElMessage.success('更新成功');
  } catch (err) {
    row.status = prevStatus;
    ElMessage.error('更新失败');
  }
};

// 同步能力
const updateSyncControlUtils = async (row: ApplicationAuthorization) => {
  await ApplicationAuthorizationApi.save({
    organId: row.organId,
    applicationId: row.applicationId,
    controlDomainId: row.controlDomainId
  })

  ElMessage.success('同步成功')
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