<template>
  <div class="resource-api-endpoint-page">
    <!-- 查询表单 -->
    <el-card class="resource-api-endpoint-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <!-- 业务特定查询字段 -->
        <el-form-item label="所属应用">
          <el-select v-model="queryForm.applicationId" placeholder="请选择所属应用" clearable style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="后端接口标签">
          <el-select v-model="queryForm.apiTag" placeholder="请选择后端接口标签" clearable style="width: 200px">
            <el-option v-for="item in apiTagOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="接口名称">
          <el-input v-model="queryForm.apiName" placeholder="请输入接口名称" clearable style="width: 200px" />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="resource-api-endpoint-page__header">
      <div class="resource-api-endpoint-page__title-group">
        <h2>管理资源接口数据</h2>
      </div>
      <el-button type="primary" v-permission="'resource-api-endpoint:add'" @click="handleCreate">新增资源接口</el-button>
    </div>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="id" label="资源接口序号" width="120" />
      <el-table-column prop="applicationId" label="所属应用" width="130">
        <template #default="{ row }">
          {{applicationOptions.find(item => item.value === row?.applicationId)?.label || ''}}
        </template>
      </el-table-column>
      <el-table-column prop="apiTag" label="后端接口标签" width="180" />
      <el-table-column prop="apiName" label="后端接口名称" width="180" />
      <el-table-column prop="apiUrl" label="后端接口路径" width="180" />
      <el-table-column prop="requestMethod" label="请求方法" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" v-permission="'resource-api-endpoint:edit'" link size="small"
            @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" v-permission="'resource-api-endpoint:delete'" link size="small"
            @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="resource-api-endpoint-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑资源接口' : '新增资源接口'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <!-- 所属应用 -->
        <el-form-item label="所属应用" prop="applicationId" v-if="!isEdit">
          <el-select v-model="editForm.applicationId" placeholder="请选择所属应用" style="width: 280px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="后端接口" prop="apiEndpointId">
          <el-select v-model="editForm.apiEndpointId" placeholder="请选择后端接口" style="width: 280px">
            <el-option v-for="item in apiEndpointOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit">保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ResourceApiEndpointApi } from './api';
import { ApiEndpointApi } from '../api-endpoint/api';
import { ApplicationApi } from '../application/api';
import type { ResourceApiEndpoint, ResourceApiEndpointPayload, ResourceApiEndpointQuery } from './type';
import type { PageSelectListDto } from '@platform/types/api.type';

// 业务查询状态
const queryForm = reactive({
  applicationId: undefined as number | undefined,
  apiTag: '',
  apiName: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义字典引用
const applicationOptions = ref<Array<{ label: string; value: number }>>([]);
const apiTagOptions = ref<Array<{ label: string; value: string }>>([]);
const apiEndpointOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取字典信息
const loadDicts = async () => {
  apiTagOptions.value = (await ApiEndpointApi.apiTags()).map(u => ({
    value: u,
    label: u,
  }));

  applicationOptions.value = (await ApplicationApi.id2name()).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));

  apiEndpointOptions.value = (await ApiEndpointApi.list()).map(u => ({
    value: u.id,
    label: `${u.apiName}[${u.requestMethod}-${u.apiUrl}]`
  }));

};

// 定义列表引用
const tableData = ref<ResourceApiEndpoint[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ResourceApiEndpointQuery;

    // 请求分页数据
    const pageData = await ResourceApiEndpointApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ResourceApiEndpointQuery);
    
    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: any) {
    ElMessage.error(error.message || '加载列表失败');
  }
};

// 查询
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 重置查询条件
const handleReset = () => {
  queryForm.applicationId = undefined;
  queryForm.apiTag = '';
  queryForm.apiName = '';
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

// 删除数据记录
const handleDelete = (row: ResourceApiEndpoint) => {
  ElMessageBox.confirm(`确认删除资源接口「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ResourceApiEndpointApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success('删除成功');
      } catch (error: any) {
        ElMessage.error(error.message || '删除失败');
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
  applicationId: undefined as number | undefined,
  apiEndpointId: undefined as number | undefined,
});

// 表单校验规则
const editRules: FormRules = {
  applicationId: [{ required: true, message: '请输入所属应用', trigger: 'blur' }],
  apiEndpointId: [{ required: true, message: '请选择后端接口', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.applicationId = undefined;
  editForm.apiEndpointId = undefined;
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ResourceApiEndpoint) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();
  
  editForm.id = row.id;
  editForm.applicationId = row.applicationId;
  editForm.apiEndpointId = row.apiEndpointId;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ResourceApiEndpointPayload = {
    applicationId: editForm.applicationId,
    apiEndpointId: editForm.apiEndpointId,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ResourceApiEndpointApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
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
.resource-api-endpoint-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.resource-api-endpoint-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.resource-api-endpoint-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-api-endpoint-page__header h2 {
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

.resource-api-endpoint-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.resource-api-endpoint-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
