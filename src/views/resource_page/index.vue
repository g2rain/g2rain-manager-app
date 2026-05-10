<template>
  <div class="resource-page-page">
    <!-- 查询表单 -->
    <el-card class="resource-page-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <!-- 业务特定查询字段 -->
        <el-form-item label="所属应用">
          <el-select v-model="queryForm.applicationId" placeholder="请选择所属应用" clearable style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="页面名称">
          <el-input v-model="queryForm.pageName" placeholder="请输入页面名称" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="页面编码">
          <el-input v-model="queryForm.pageCode" placeholder="请输入页面编码" clearable style="width: 200px" />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="resource-page-page__header">
      <div class="resource-page-page__title-group">
        <h2>管理页面数据</h2>
      </div>
      <el-button type="primary" v-permission="'resource_page:add'" @click="handleCreate">新增页面</el-button>
    </div>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="applicationId" label="所属应用" width="130">
        <template #default="{ row }">
          {{applicationOptions.find(item => item.value === row?.applicationId)?.label || ''}}
        </template>
      </el-table-column>
      <el-table-column prop="id" label="页面序号" width="160" />
      <el-table-column prop="pageName" label="页面名称" width="160" />
      <el-table-column prop="pageCode" label="页面编码" width="180" />
      <el-table-column prop="linkPath" label="链接路径" width="240" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" v-permission="'resource_page:edit'" link size="small"
            @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" v-permission="'resource_page:page_element_mgmt'" link size="small"
            @click="handlePageElement(row)">管理页面元素</el-button>
          <el-button type="danger" v-permission="'resource_page:delete'" link size="small"
            @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="resource-page-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑页面' : '新增页面'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <!-- 所属应用 -->
        <el-form-item label="所属应用" prop="applicationId" v-if="!isEdit">
          <el-select v-model="editForm.applicationId" placeholder="请选择所属应用" style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="页面名称" prop="pageName">
          <el-input v-model="editForm.pageName" placeholder="请输入页面名称" />
        </el-form-item>

        <el-form-item label="页面编码" prop="pageCode">
          <el-input v-model="editForm.pageCode" placeholder="请输入页面编码" />
        </el-form-item>

        <el-form-item label="页面路径" prop="linkPath">
          <el-input v-model="editForm.linkPath" placeholder="请输入链接路径" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit">保 存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 管理页面元素弹窗 -->
    <el-dialog v-model="pageElementDialogVisible" title="管理页面元素" width="1010px">
      <ResourcePageElementPage :pageCode="selectedPageCode" :applicationId="selectedApplicationId" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ResourcePageApi } from './api';
import { ApplicationApi } from '../application/api';
import ResourcePageElementPage from '../resource_page_element/index.vue'
import type { ResourcePage, ResourcePagePayload, ResourcePageQuery } from './type';
import type { PageSelectListDto } from '@platform/types/api.type';

// 业务查询状态
const queryForm = reactive({
  applicationId: undefined as number | undefined,
  pageName: '',
  pageCode: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义字典引用
const applicationOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取字典信息
const loadDicts = async () => {
  applicationOptions.value = (await ApplicationApi.id2name({
    includeApplicationTypes: ['SUPPORT', 'SYSTEM']
  })).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));
};

// 定义列表引用
const tableData = ref<ResourcePage[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ResourcePageQuery;

    // 请求分页数据
    const pageData = await ResourcePageApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ResourcePageQuery);
    
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
  // 重置业务特定查询表单
  queryForm.applicationId = undefined;
  queryForm.pageName = '';
  queryForm.pageCode = '';
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
const handleDelete = (row: ResourcePage) => {
  ElMessageBox.confirm(`确认删除页面「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ResourcePageApi.remove(row.id);
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
  pageName: '',
  pageCode: '',
  linkPath: '',
});

// 表单校验规则
const editRules: FormRules = {
  applicationId: [{ required: true, message: '请选择归属应用', trigger: 'blur' }],
  pageName: [{ required: true, message: '请输入页面名称', trigger: 'blur' }],
  pageCode: [{ required: true, message: '请输入页面编码', trigger: 'blur' }],
  linkPath: [{ required: true, message: '请输入链接路径', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.applicationId = undefined;
  editForm.pageName = '';
  editForm.pageCode = '';
  editForm.linkPath = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ResourcePage) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();
  
  editForm.id = row.id;
  editForm.applicationId = row.applicationId;
  editForm.pageName = row.pageName;
  editForm.pageCode = row.pageCode;
  editForm.linkPath = row.linkPath;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ResourcePagePayload = {
    applicationId: editForm.applicationId,
    pageName: editForm.pageName,
    pageCode: editForm.pageCode,
    linkPath: editForm.linkPath,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ResourcePageApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

// 弹窗状态
const pageElementDialogVisible = ref(false);
const selectedPageCode = ref('');
const selectedApplicationId = ref<number | undefined>(undefined);

// 打开页面元素弹窗
const handlePageElement = (row: ResourcePage) => {
  selectedPageCode.value = row.pageCode;
  selectedApplicationId.value = row.applicationId!;
  pageElementDialogVisible.value = true;
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
.resource-page-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.resource-page-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.resource-page-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-page-page__header h2 {
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

.resource-page-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.resource-page-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
