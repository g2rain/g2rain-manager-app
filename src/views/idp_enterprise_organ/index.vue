
<template>
  <div class="idp_enterprise_organ-page">
    <!-- 查询表单 -->
    <el-card class="idp_enterprise_organ-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="身份源类型">
          <el-input v-model="queryForm.idpType" placeholder="请输入身份源类型" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="IDP侧企业ID">
          <el-input v-model="queryForm.enterpriseId" placeholder="请输入IDP侧企业/租户ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="机构标识">
          <el-input v-model="queryForm.organId" placeholder="请输入机构标识" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <DictSelect v-model="queryForm.status" usage-code="STATUS" :api-method="DictItemApi.select" placeholder="请选择状态" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="queryForm.remark" placeholder="请输入备注" clearable style="width: 200px" />
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
    <div class="idp_enterprise_organ-page__header">
      <div class="idp_enterprise_organ-page__title-group">
        <h2>管理外部企业数据</h2>
      </div>
      <el-button type="primary" v-permission="'idp_enterprise_organ:add'" @click="handleCreate">新增外部企业</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="idpType" label="身份源类型" width="180" />
      <el-table-column prop="enterpriseId" label="外部企业/租户ID" width="180" />
      <el-table-column prop="organId" label="机构标识，关联 organ.id" width="140" />
      <el-table-column prop="status" label="状态" width="180">
        <template #default="{ row: item }">
          <DictText :value="item?.status" usage-code="STATUS" :api-method="DictItemApi.select" />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="180" />
      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />
      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">明细</el-button>
          <el-button type="primary" v-permission="'idp_enterprise_organ:edit'" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" v-permission="'idp_enterprise_organ:delete'" link size="small" @click="handleDelete(row)">删除</el-button>
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
    <div class="idp_enterprise_organ-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑外部企业' : '新增外部企业'" width="520px" append-to-body destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="身份源类型" prop="idpType">
          <el-input v-model="editForm.idpType" placeholder="请输入身份源类型" />
        </el-form-item>
        <el-form-item label="外部企业/租户ID" prop="enterpriseId">
          <el-input v-model="editForm.enterpriseId" placeholder="请输入外部企业/租户ID" />
        </el-form-item>
        <el-form-item label="机构标识，关联 organ.id" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构标识，关联 organ.id" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <DictSelect v-model="editForm.status" usage-code="STATUS" :api-method="DictItemApi.select" :clearable="false" placeholder="请选择状态" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit">保 存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 明细抽屉 -->
    <el-drawer v-model="detailDialogVisible" title="外部企业明细" direction="rtl" size="520px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="身份源类型">{{ currentRow?.idpType }}</el-descriptions-item>
        <el-descriptions-item label="外部企业/租户ID">{{ currentRow?.enterpriseId }}</el-descriptions-item>
        <el-descriptions-item label="机构标识，关联 organ.id">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <DictText :value="currentRow?.status" usage-code="STATUS" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentRow?.remark }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">关 闭</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { IdpEnterpriseOrganApi } from './api';
import { DictItemApi } from '../dict/api';
import type { IdpEnterpriseOrgan, IdpEnterpriseOrganPayload, IdpEnterpriseOrganQuery } from './type';
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
  idpType: '',
  enterpriseId: '',
  organId: undefined,
  status: '',
  remark: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<IdpEnterpriseOrgan[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as IdpEnterpriseOrganQuery;
  
    // 请求分页数据
    const pageData = await IdpEnterpriseOrganApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & IdpEnterpriseOrganQuery);
      
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
  queryForm.idpType = '';
  queryForm.enterpriseId = '';
  queryForm.organId = undefined;
  queryForm.status = '';
  queryForm.remark = '';
  
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
const currentRow = ref<IdpEnterpriseOrgan | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细  
const handleView = (row: IdpEnterpriseOrgan) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: IdpEnterpriseOrgan) => {
  ElMessageBox.confirm(`确认删除外部企业「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await IdpEnterpriseOrganApi.remove(row.id);
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
  idpType: '',
  enterpriseId: '',
  organId: undefined as number | undefined,
  status: '',
  remark: '',
});

// 表单校验规则
const editRules: FormRules = {
  idpType: [{ required: true, message: '请输入身份源类型', trigger: 'blur' }],
  enterpriseId: [{ required: true, message: '请输入外部企业/租户标识', trigger: 'blur' }],
  organId: [{ required: true, message: '请输入机构标识，关联 organ.id', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.idpType = '';
  editForm.enterpriseId = '';
  editForm.organId = undefined;
  editForm.status = '';
  editForm.remark = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: IdpEnterpriseOrgan) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.idpType = row.idpType;
  editForm.enterpriseId = row.enterpriseId;
  editForm.organId = row.organId;
  editForm.status = row.status;
  editForm.remark = row.remark;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: IdpEnterpriseOrganPayload = {
    idpType: editForm.idpType,
    enterpriseId: editForm.enterpriseId,
    organId: editForm.organId,
    status: editForm.status,
    remark: editForm.remark,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await IdpEnterpriseOrganApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    showErrorMessage(error || '保存失败');
  }
};

// 挂载回调
onMounted(() => {
  // 查询列表
  loadData();
});
</script>

<style scoped>
.idp_enterprise_organ-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.idp_enterprise_organ-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.idp_enterprise_organ-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.idp_enterprise_organ-page__header h2 {
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

.idp_enterprise_organ-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.idp_enterprise_organ-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

