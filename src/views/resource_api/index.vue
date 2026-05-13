<template>
  <div class="resource_api-page">
    <!-- 查询表单 -->
    <el-card class="resource_api-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="服务名称">
          <el-select v-model="queryForm.serviceCode" placeholder="请选择服务名称" clearable style="width: 200px">
            <el-option v-for="item in srvRegistryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口标签">
          <el-input v-model="queryForm.apiTags" placeholder="请输入接口标签" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="接口名称">
          <el-input v-model="queryForm.name" placeholder="请输入接口名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-input v-model="queryForm.method" placeholder="请输入请求方法" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="请求路径">
          <el-input v-model="queryForm.path" placeholder="请输入请求路径" clearable style="width: 200px" />
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
    <div class="resource_api-page__header">
      <div class="resource_api-page__title-group">
        <h2>管理资源接口数据</h2>
      </div>
      <div style="display:flex; gap:8px;">
        <el-button type="primary" v-permission="'resource_api:import'" @click="handleImport">导入资源接口</el-button> 
        <el-button type="primary" v-permission="'resource_api:add'" @click="handleCreate">新增资源接口</el-button>
      </div>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" label="资源接口标识" width="120" />
      <el-table-column prop="serviceName" label="服务名称" width="180" />
      <el-table-column prop="apiTags" label="接口标签" width="180" />
      <el-table-column prop="name" label="接口名称" width="180" />
      <el-table-column prop="method" label="请求方法" width="180" />
      <el-table-column prop="path" label="请求路径" width="180" />
      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />
      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">明细</el-button>
          <el-button type="primary" v-permission="'resource_api:edit'" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" v-permission="'resource_api:delete'" link size="small" @click="handleDelete(row)">删除</el-button>
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
    <div class="resource_api-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑资源接口' : '新增资源接口'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="服务名称" prop="serviceCode">
          <el-select v-model="editForm.serviceCode" :disabled="isEdit" placeholder="请选择服务名称" style="width: 200px">
            <el-option v-for="item in srvRegistryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口标签" prop="apiTags">
          <el-input v-model="editForm.apiTags" placeholder="请输入接口标签" />
        </el-form-item>
        <el-form-item label="接口名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入接口名称" />
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-input v-model="editForm.method" placeholder="请输入请求方法" />
        </el-form-item>
        <el-form-item label="请求路径" prop="path">
          <el-input v-model="editForm.path" placeholder="请输入请求路径" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" placeholder="请输入描述" />
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
    <el-dialog v-model="detailDialogVisible" title="资源接口明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="服务名称">
          <el-tag>
            {{srvRegistryOptions.find(item => item.value === currentRow?.serviceCode)?.label || ''}}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="接口标签">{{ currentRow?.apiTags }}</el-descriptions-item>
        <el-descriptions-item label="接口名称">{{ currentRow?.name }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ currentRow?.method }}</el-descriptions-item>
        <el-descriptions-item label="请求路径">{{ currentRow?.path }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentRow?.description }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="导入资源接口" width="520px">
      <el-form ref="importFormRef" :model="importForm" :rules="importRules" label-width="100px">
        <el-form-item label="服务名称" prop="serviceCode">
          <el-select v-model="importForm.serviceCode" placeholder="请选择服务名称" style="width: 200px" @change="handleImportServiceChange">
            <el-option v-for="item in routeOptions" :key="item.serviceCode" :label="item.name" :value="item.serviceCode" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitImport">保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ResourceApiApi } from './api';
import { ServiceRegistryApi } from '../service_registry/api';
import type {
  ResourceApi,
  ResourceApiPayload,
  ResourceApiQuery,
  UploadApiDto,
} from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm, showErrorMessage } from '@/components';
import { getHttpClient } from '@/components/http';

// 定义字典引用
const srvRegistryOptions = ref<Array<{ label: string; value: string }>>([]);
const routeOptions = ref<Array<{ serviceCode: string; routePrefix: string; name: string }>>([]);
const importApiDocs = ref<UploadApiDto[]>([]);

// 获取字典信息
const loadDicts = async () => {
  const list = await ServiceRegistryApi.list();
  srvRegistryOptions.value = list.map(u => ({
    value: u.serviceCode,
    label: u.name,
  }));

  routeOptions.value = list.map(u => ({
    serviceCode: u.serviceCode,
    routePrefix: u.routePrefix,
    name: u.name,
  }));
};

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
  apiTags: '',
  name: '',
  method: '',
  path: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ResourceApi[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ResourceApiQuery;

    // 请求分页数据
    const pageData = await ResourceApiApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ResourceApiQuery);

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
  queryForm.apiTags = '';
  queryForm.name = '';
  queryForm.method = '';
  queryForm.path = '';
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
const currentRow = ref<ResourceApi | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ResourceApi) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ResourceApi) => {
  ElMessageBox.confirm(`确认删除资源「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ResourceApiApi.remove(row.id);
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
  apiTags: '',
  name: '',
  method: '',
  path: '',
  description: '',
});

// 表单校验规则 
const editRules: FormRules = {
  serviceCode: [{ required: true, message: '请输入服务编码', trigger: 'blur' }],
  apiTags: [{ required: true, message: '请输入接口标签', trigger: 'blur' }],
  name: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
  method: [{ required: true, message: '请输入请求方法', trigger: 'blur' }],
  path: [{ required: true, message: '请输入请求路径', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.serviceCode = '';
  editForm.apiTags = '';
  editForm.name = '';
  editForm.method = '';
  editForm.path = '';
  editForm.description = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ResourceApi) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.serviceCode = row.serviceCode;
  editForm.apiTags = row.apiTags;
  editForm.name = row.name;
  editForm.method = row.method;
  editForm.path = row.path;
  editForm.description = row.description;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ResourceApiPayload = {
    serviceCode: editForm.serviceCode,
    apiTags: editForm.apiTags,
    name: editForm.name,
    method: editForm.method,
    path: editForm.path,
    description: editForm.description,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ResourceApiApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    showErrorMessage(error || '保存失败');
  }
};

// 导入弹窗引用
const importDialogVisible = ref(false);

// 导入组件引用
const importFormRef = ref<FormInstance | null>(null);

  // 保存表单状态
const importForm = reactive({
  serviceCode: '',
});

// 表单校验规则 
const importRules: FormRules = {
  serviceCode: [{ required: true, message: '请输入服务编码', trigger: 'blur' }],
};

// 打开导入弹窗
const handleImport = () => {
  importFormRef.value?.clearValidate();
  importForm.serviceCode = "";
  importApiDocs.value = [];
  importDialogVisible.value = true;
};

interface ApiDocItem {
  tags?: string[];
  summary?: string;
  description?: string;
}

interface ApiDocResponse {
  paths?: Record<string, Record<string, ApiDocItem>>;
}

const normalizeRoutePrefix = (routePrefix: string) =>
  routePrefix.replace(/^\/+/, '').replace(/\/+$/, '');

const handleImportServiceChange = async (serviceCode: string) => {
  const selected = routeOptions.value.find(item => item.serviceCode === serviceCode);
  if (!selected?.routePrefix) {
    importApiDocs.value = [];
    return;
  }

  const prefix = normalizeRoutePrefix(selected.routePrefix);
  const docsUrl = `/${prefix}/v3/api-docs`;

  try {
    const http = getHttpClient('docs');
    const res = await http.get<ApiDocResponse>(docsUrl);
    const paths = (res as ApiDocResponse)?.paths || {};
    const parsed: UploadApiDto[] = [];
    Object.entries(paths).forEach(([path, methods]) => {
      Object.entries(methods || {}).forEach(([method, api]) => {
        parsed.push({
          path,
          method: method.toUpperCase(),
          apiTags: (api.tags || []).join(','),
          name: api.summary || '',
          description: api.description || '',
        });
      });
    });

    importApiDocs.value = parsed;
  } catch (error: any) {
    importApiDocs.value = [];
    showErrorMessage(error || '加载 API 文档失败');
  }
};

// 导入数据表单
const submitImport = async () => {
  if (!importFormRef.value) return;
  const valid = await importFormRef.value.validate();
  if (!valid) return;

  try {
    if (!importApiDocs.value.length) {
      ElMessage.warning('未获取到可导入的接口，请先选择服务并确认 api-docs 可访问');
      return;
    }

    const importCount = await ResourceApiApi.batchImport(importForm.serviceCode, {
      apis: importApiDocs.value,
    });

    ElMessage.success(`导入成功，共 ${importCount} 条`);
    await loadData();
    importDialogVisible.value = false;
  } catch (error: any) {
    showErrorMessage(error || '导入失败');
  }
};

// 挂载回调
onMounted(async() => {
  // 先准备字典
  await loadDicts();
  // 再查询列表
  await loadData();
});
</script>

<style scoped>
.resource_api-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.resource_api-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.resource_api-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource_api-page__header h2 {
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

.resource_api-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.resource_api-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

