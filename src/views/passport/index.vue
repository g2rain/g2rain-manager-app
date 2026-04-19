<template>
  <div class="passport-page">
    <!-- 查询表单 -->
    <el-card class="passport-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="queryForm.realName" placeholder="请输入姓名" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="手机号码">
          <el-input v-model="queryForm.mobile" placeholder="请输入手机号码" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="邮箱地址">
          <el-input v-model="queryForm.email" placeholder="请输入邮箱地址" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="账号状态">
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
    <div class="passport-page__header">
      <div class="passport-page__title-group">
        <h2>管理账号数据</h2>
      </div>
      <el-button type="primary" v-permission="'passport:add'" @click="handleCreate">新增账号</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="username" label="用户名" width="180" />

      <el-table-column prop="realName" label="姓名" width="180" />

      <el-table-column prop="status" label="账号状态" width="180">
        <template #default="{ row }">
          <el-switch 
            v-permission="'passport:status-update'"
            v-model="row.status" 
            inline-prompt :active-value="'NORMAL'" 
            :inactive-value="'FROZEN'"
            :active-text="statusOptions.find(item => item.value === 'NORMAL')?.label"
            :inactive-text="statusOptions.find(item => item.value === 'FROZEN')?.label" 
            @change="updateStatus(row)" 
          />
        </template>
      </el-table-column>

      <el-table-column prop="mobile" label="手机号码" width="180" />

      <el-table-column prop="email" label="邮箱地址" width="180" />

      <el-table-column prop="sex" label="性别" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            {{sexOptions.find(item => item.value === row?.sex)?.label || ''}}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="birthday" label="出身日期" width="180" />

      <el-table-column prop="idNo" label="身份证号" width="180" />

      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />
      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />

      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">明细</el-button>
          <el-button type="primary" v-permission="'passport:edit'" link size="small"
            @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" v-permission="'passport:delete'" link size="small"
            @click="handleDelete(row)">删除</el-button>
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
    <div class="passport-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑账号' : '新增账号'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="editForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>

        <el-form-item label="姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="editForm.sex">
            <el-radio v-for="option in sexOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出生日期" prop="birthday">
          <el-input v-model="editForm.birthday" placeholder="请输入出生日期" />
        </el-form-item>

        <el-form-item label="身份证号" prop="idNo">
          <el-input v-model="editForm.idNo" placeholder="请输入身份证号" />
        </el-form-item>

        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="editForm.mobile" placeholder="请输入手机号码" />
        </el-form-item>

        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱地址" />
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
    <el-dialog v-model="detailDialogVisible" title="账号明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{ currentRow?.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentRow?.realName }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <el-tag>
            {{sexOptions.find(item => item.value === currentRow?.sex)?.label || ''}}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ currentRow?.birthday }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ currentRow?.idNo }}</el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ currentRow?.mobile }}</el-descriptions-item>
        <el-descriptions-item label="邮箱地址">{{ currentRow?.email }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="currentRow?.status === 'NORMAL' ? 'success' : 'info'">
            {{statusOptions.find(item => item.value === currentRow?.status)?.label || ''}}
          </el-tag>
        </el-descriptions-item>
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
import { PassportApi } from './api';
import type { Passport, PassportPayload, PassportQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@/components';

// 定义字典引用
const statusOptions = ref<Array<{ label: string; value: string }>>([]);
const sexOptions = ref<Array<{ label: string; value: string }>>([]);

// 获取字典信息
const loadDicts = async () => {
  statusOptions.value = [{
    label: '正常',
    value: 'NORMAL'
  }, {
    label: '冻结',
    value: 'FROZEN'
  }];

  sexOptions.value = [{
    label: '男性',
    value: 'MALE'
  }, {
    label: '女性',
    value: 'FEMALE'
  }];
};

// 定义组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询状态（使用 ref，便于 v-model 替换整个对象时保持响应式）
const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  username: '',
  realName: '',
  mobile: '',
  email: '',
  status: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<Passport[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as PassportQuery;

    // 请求分页数据
    const pageData = await PassportApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & PassportQuery);

    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: any) {
    ElMessage.error(error.message || '加载列表失败');
  }
};

// 处理排序字段
const handleSortChange = (params: Record<string, string>) => {
  // 更新 QueryForm 的 sorts 字段
  queryFormRef.value?.updateSorts(params);
};

// 查询数据列表
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 重置查询条件
const handleReset = () => {
  // 重置基础查询表单
  baseQueryForm.value.id = undefined;
  baseQueryForm.value.createTime = undefined;
  baseQueryForm.value.updateTime = undefined;
  baseQueryForm.value.sorts = undefined;
  // 重置业务特定查询表单
  queryForm.username = '';
  queryForm.realName = '';
  queryForm.mobile = '';
  queryForm.email = '';
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

// 调整页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<Passport | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: Passport) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: Passport) => {
  ElMessageBox.confirm(`确认删除账号「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await PassportApi.remove(row.id);
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
  username: '',
  password: '',
  realName: '',
  sex: 'MALE',
  birthday: '',
  idNo: '',
  mobile: '',
  email: '',
});

// 表单校验规则
const editRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: !isEdit.value, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  sex: [{ required: false, message: '请输入性别', trigger: 'blur' }],
  birthday: [{ required: false, message: '请输入出生日期', trigger: 'blur' }],
  idNo: [{ required: false, message: '请输入身份证号', trigger: 'blur' }],
  mobile: [{ required: false, message: '请输入手机号码', trigger: 'blur' }],
  email: [{ required: false, message: '请输入邮箱地址', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.username = '';
  editForm.password = '';
  editForm.realName = '';
  editForm.sex = 'MALE';
  editForm.birthday = '';
  editForm.idNo = '';
  editForm.mobile = '';
  editForm.email = '';

  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: Passport) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.username = row.username;
  editForm.password = row.password;
  editForm.realName = row.realName;
  editForm.sex = row.sex;
  editForm.birthday = row.birthday;
  editForm.idNo = row.idNo;
  editForm.mobile = row.mobile;
  editForm.email = row.email;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) {
    return
  };

  if (!(await editFormRef.value.validate())) {
    return;
  }

  const payload: PassportPayload = {
    username: editForm.username,
    password: editForm.password,
    realName: editForm.realName,
    sex: editForm.sex,
    birthday: editForm.birthday,
    idNo: editForm.idNo,
    mobile: editForm.mobile,
    email: editForm.email,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await PassportApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

// 修改账号状态
const updateStatus = async (row: any) => {
  try {
    await PassportApi.updateStatus(row.id, row.status);
    await loadData();
    ElMessage.success('更新成功');
  } catch (err) {
    ElMessage.error('更新失败');
    row.canIntegrate = !row.canIntegrate; // 回退状态
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
.passport-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.passport-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.passport-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.passport-page__header h2 {
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

.passport-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.passport-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>