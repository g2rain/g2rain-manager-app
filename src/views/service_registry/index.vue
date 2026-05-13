<template>
  <div class="service_registry-page">
    <!-- 查询表单 -->
    <el-card class="service_registry-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch" >
        <!-- 业务特定查询字段 -->
        <el-form-item label="服务编码">
          <el-input v-model="queryForm.serviceCode" placeholder="请输入服务编码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="服务名称">
          <el-input v-model="queryForm.name" placeholder="请输入服务名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="目标地址">
          <el-input v-model="queryForm.endpoint" placeholder="请输入目标地址" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="路由前缀">
          <el-input v-model="queryForm.routePrefix" placeholder="请输入路由前缀" clearable style="width: 200px" />
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
    <div class="service_registry-page__header">
      <div class="service_registry-page__title-group">
        <h2>管理服务注册数据</h2>
      </div>
      <el-button type="primary" v-permission="'service_registry:add'" @click="handleCreate">新增服务注册</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" label="服务注册序号" width="120" />
      <el-table-column prop="serviceCode" label="服务编号" width="180" />
      <el-table-column prop="name" label="服务名称" width="180" />
      <el-table-column prop="endpoint" label="目标地址" width="180" />
      <el-table-column prop="routePrefix" label="路由前缀" width="180" />
      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />
      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">明细</el-button>
          <el-button type="primary" v-permission="'service_registry:edit'" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" v-permission="'service_registry:delete'" link size="small" @click="handleDelete(row)">删除</el-button>
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
    <div class="service_registry-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑服务注册' : '新增服务注册'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="服务编码" prop="serviceCode">
          <el-input v-model="editForm.serviceCode" placeholder="请输入服务编码" />
        </el-form-item>
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="目标地址" prop="endpoint">
          <el-input v-model="editForm.endpoint" placeholder="请输入目标地址" />
        </el-form-item>
        <el-form-item label="路由前缀" prop="routePrefix">
          <el-input v-model="editForm.routePrefix" placeholder="请输入路由前缀" />
        </el-form-item>
        <el-form-item label="服务说明" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="4" placeholder="请输入服务说明" show-word-limit
            maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit">保 存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 明细弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="服务注册明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="服务注册标识">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="服务编码">{{ currentRow?.serviceCode }}</el-descriptions-item>
        <el-descriptions-item label="服务名称">{{ currentRow?.name }}</el-descriptions-item>
        <el-descriptions-item label="目标地址">{{ currentRow?.endpoint }}</el-descriptions-item>
        <el-descriptions-item label="路由前缀">{{ currentRow?.routePrefix }}</el-descriptions-item>
        <el-descriptions-item label="服务说明">{{ currentRow?.description }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ServiceRegistryApi } from './api';
import type { ServiceRegistry, ServiceRegistryPayload, ServiceRegistryQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm, showErrorMessage } from '@/components';

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询表单（BaseSelectListDto）
const baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务特定查询表单
const queryForm = reactive({
  serviceCode: '',
  name: '',
  endpoint: '',
  routePrefix: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const tableData = ref<ServiceRegistry[]>([]);

const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ServiceRegistryQuery;

    // 请求分页数据
    const pageData = await ServiceRegistryApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ServiceRegistryQuery);
    
    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: any) {
    showErrorMessage(error || '加载列表失败');
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
  queryForm.serviceCode = '';
  queryForm.name = '';
  queryForm.endpoint = '';
  queryForm.routePrefix = '';
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
const currentRow = ref<ServiceRegistry | null>(null);
// 明细弹窗引用  
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ServiceRegistry) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ServiceRegistry) => {
  ElMessageBox.confirm(`确认删除服务注册「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ServiceRegistryApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success('删除成功');
      } catch (error: any) {
        showErrorMessage(error || '删除失败');
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
  serviceCode: '',
  name: '',
  endpoint: '',
  routePrefix: '',
  description: '',
});

// 表单校验规则
const editRules: FormRules = {
  serviceCode: [{ required: true, message: '请输入服务编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  endpoint: [{ required: true, message: '请输入目标地址', trigger: 'blur' }],
  routePrefix: [{ required: true, message: '请输入路由前缀', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();
  editForm.id = undefined;
  editForm.serviceCode = '';
  editForm.name = '';
  editForm.endpoint = '';
  editForm.routePrefix = '';
  editForm.description = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ServiceRegistry) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.serviceCode = row.serviceCode;
  editForm.name = row.name;
  editForm.endpoint = row.endpoint;
  editForm.routePrefix = row.routePrefix;
  editForm.description = row.description;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ServiceRegistryPayload = {
    serviceCode: editForm.serviceCode,
    name: editForm.name,
    endpoint: editForm.endpoint,
    routePrefix: editForm.routePrefix,
    description: editForm.description,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ServiceRegistryApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    showErrorMessage(error || '保存失败');
  }
};

// 挂载回调
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.service_registry-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.service_registry-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.service_registry-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service_registry-page__header h2 {
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

.service_registry-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.service_registry-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

