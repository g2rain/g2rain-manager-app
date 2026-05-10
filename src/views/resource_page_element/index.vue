<template>
  <div class="resource-page-element-page">
    <!-- 查询表单 -->
    <el-card class="resource-page-element-page__search" shadow="never">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <!-- 业务特定查询字段 -->
        <el-form-item label="页面元素名称">
          <el-input v-model="queryForm.pageElementName" placeholder="请输入页面元素名称" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="页面元素编码">
          <el-input v-model="queryForm.pageElementCode" placeholder="请输入页面元素编码" clearable style="width: 200px" />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="resource-page-element-page__header">
      <div class="resource-page-element-page__title-group">
        <h2>管理页面元素数据</h2>
      </div>
      <el-button type="primary" @click="handleCreate">新增页面元素</el-button>
    </div>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="id" label="页面元素序号" width="120" />
      <el-table-column prop="pageElementName" label="页面元素名称" width="180" />
      <el-table-column prop="pageElementCode" label="页面元素编码" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column label="操作" fixed="right" width="98">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger"  link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="resource-page-element-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑页面元素' : '新增页面元素'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item label="页面元素名称" prop="pageElementName">
          <el-input v-model="editForm.pageElementName" placeholder="请输入页面元素名称" />
        </el-form-item>

        <el-form-item label="页面元素编码" prop="pageElementCode">
          <el-input v-model="editForm.pageElementCode" placeholder="请输入页面元素编码" />
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
import { ref, reactive, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ResourcePageElementApi } from './api';
import type { ResourcePageElement, ResourcePageElementPayload, ResourcePageElementQuery } from './type';
import type { PageSelectListDto } from '@platform/types/api.type';

// 接收父页面传来的参数
const props = defineProps<{ applicationId?: number; pageCode?: string }>();

// 业务查询状态
const queryForm = reactive({
  applicationId: props.applicationId,
  pageCode: props.pageCode,
  pageElementName: '',
  pageElementCode: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ResourcePageElement[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ResourcePageElementQuery;

    // 请求分页数据
    const pageData = await ResourcePageElementApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ResourcePageElementQuery);

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
  queryForm.applicationId = props.applicationId;
  queryForm.pageCode = props.pageCode;
  queryForm.pageElementName = '';
  queryForm.pageElementCode = '';
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
const handleDelete = (row: ResourcePageElement) => {
  ElMessageBox.confirm(`确认删除页面元素「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ResourcePageElementApi.remove(row.id);
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
  applicationId: props.applicationId,
  pageCode: props.pageCode,
  pageElementName: '',
  pageElementCode: '',
});

// 表单校验规则
const editRules: FormRules = {
  pageElementName: [{ required: true, message: '请输入页面元素名称', trigger: 'blur' }],
  pageElementCode: [{ required: true, message: '请输入页面元素编码', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.applicationId = props.applicationId;
  editForm.pageCode = props.pageCode;
  editForm.pageElementName = '';
  editForm.pageElementCode = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ResourcePageElement) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.applicationId = row.applicationId;
  editForm.pageCode = row.pageCode;
  editForm.pageElementName = row.pageElementName;
  editForm.pageElementCode = row.pageElementCode;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  if (!editForm.applicationId) {
    ElMessage.error('请设置应用');
    return
  }

  if (!editForm.pageCode) {
    ElMessage.error('请设置页面编码');
    return
  }

  const payload: ResourcePageElementPayload = {
    applicationId: editForm.applicationId,
    pageCode: editForm.pageCode,
    pageElementName: editForm.pageElementName,
    pageElementCode: editForm.pageElementCode,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ResourcePageElementApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

// 监听 props 变化，每次传入新的 applicationId/pageCode 都刷新
watch(
  () => [props.applicationId, props.pageCode],
  () => handleReset(),
  { immediate: true }
);
</script>

<style scoped>
.resource-page-element-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.resource-page-element-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.resource-page-element-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-page-element-page__header h2 {
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

.resource-page-element-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.resource-page-element-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
