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
          <DictSelect v-model="queryForm.status" usage-code="PASSPORT_STATUS" :api-method="DictItemApi.select" placeholder="请选择状态" />
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

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" label="账号标识" width="180">
        <template #default="{ row }">
          <el-button type="primary" link @click="openUserListDialog(row)">{{ row.id }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="180" />
      <el-table-column prop="realName" label="姓名" width="180" />
      <el-table-column prop="status" label="账号状态" width="180">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            permission="passport:status_update"
            active-value="NORMAL"
            inactive-value="FROZEN"
            :options="statusOptions"
            :api-method="({ nextValue }) => PassportApi.updateStatus(row.id, String(nextValue))"
            @success="loadData"
          />
        </template>
      </el-table-column>
      <el-table-column prop="mobile" label="手机号码" width="180" />
      <el-table-column prop="email" label="邮箱地址" width="180" />
      <el-table-column prop="sex" label="性别" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.sex" usage-code="SEX" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="birthday" label="出身日期" width="180" />
      <el-table-column prop="idNo" label="身份证号" width="180" />
      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />
      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />
      <el-table-column label="操作" fixed="right" width="360">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openIdpBindingListDialog(row)">第三方绑定</el-button>
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
          <DictSelect v-model="editForm.sex" usage-code="SEX" :api-method="DictItemApi.select" placeholder="请选择性别" />
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
        <el-descriptions-item label="账号标识">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentRow?.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentRow?.realName }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <el-tag>
            <DictText :value="currentRow?.sex" usage-code="SEX" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ currentRow?.birthday }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ currentRow?.idNo }}</el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ currentRow?.mobile }}</el-descriptions-item>
        <el-descriptions-item label="邮箱地址">{{ currentRow?.email }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="currentRow?.status === 'NORMAL' ? 'success' : 'info'">
            <DictText :value="currentRow?.status" usage-code="PASSPORT_STATUS" :api-method="DictItemApi.select" />
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

    <!-- 用户列表） -->
    <el-dialog v-model="userListDialogVisible" title="用户列表" width="960px" destroy-on-close @closed="userListRows = []">
      <el-table :data="userListRows" border stripe max-height="420">
        <el-table-column prop="id" label="用户序号" width="100" />
        <el-table-column prop="passportId" label="账号序号" width="100" />
        <el-table-column prop="organId" label="所属机构" width="100" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="admin" label="管理员" width="90">
          <template #default="{ row: u }">
            <el-tag :type="u.admin ? 'success' : 'info'" effect="light" size="small">
              {{ u.admin ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱地址" min-width="160" />
        <el-table-column prop="mobile" label="手机号码" width="130" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="userListDialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 第三方身份绑定列表 -->
    <el-drawer
      v-model="idpBindingListDrawerVisible"
      :title="`第三方身份绑定（账号 ${currentPassportId ?? ''}）`"
      direction="rtl"
      size="800px"
      destroy-on-close
      @closed="idpBindingListRows = []"
    >
      <el-table :data="idpBindingListRows" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="idpType" label="身份源类型" width="120">
          <template #default="{ row: binding }">
            <el-tag effect="light" size="small">
              <DictText :value="binding?.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" />
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="idpSubject" label="IDP侧用户授权标识" min-width="160" />
        <el-table-column prop="corpId" label="IDP侧企业ID" width="140" />
        <el-table-column prop="idpUserId" label="IDP侧用户ID" width="120" />
        <el-table-column prop="idpApplicationCode" label="IDP侧的应用ID" width="140" />
        <el-table-column prop="bindMode" label="接入形态" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="idpBindingListDrawerVisible = false">关 闭</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { PassportApi } from './api';
import { UserApi } from '../user/api';
import { PassportIdpBindingApi } from '../passport_idp_binding/api';
import { DictItemApi } from '../dict/api';
import type { Passport, PassportPayload, PassportQuery } from './type';
import type { User } from '../user/type';
import type { PassportIdpBinding } from '../passport_idp_binding/type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, DictSelect, DictText, StatusSwitch } from '@/components';

// 定义字典引用
const statusOptions = ref<Array<{ label: string; value: string }>>([]);

// 获取字典信息
const loadDicts = async () => {
  try {
    const items = await DictItemApi.loadByUsageCode('PASSPORT_STATUS');
    statusOptions.value = [...items]
      .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
      .map((item) => ({
        label: item.name || String(item.code),
        value: String(item.code),
      }));
  } catch (error) {
    console.error('加载账号状态字典失败:', error);
    statusOptions.value = [];
  }
};

// 定义组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询状态（使用 reactive v-model 替换整个对象时保持响应式）
let baseQueryForm = reactive<BaseSelectListDto>({
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
      Object.entries({ ...baseQueryForm, ...queryForm })
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
  baseQueryForm.id = undefined;
  baseQueryForm.createTime = undefined;
  baseQueryForm.updateTime = undefined;
  baseQueryForm.sorts = undefined;
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

// 查看用户列表
const userListDialogVisible = ref(false);
const userListRows = ref<User[]>([]);
const openUserListDialog = async (row: Passport) => {
  userListDialogVisible.value = true;
  userListRows.value = [];
  try {
    userListRows.value = await UserApi.list({ passportId: row.id });
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户列表失败');
  }
};

// 查看第三方身份绑定列表
const idpBindingListDrawerVisible = ref(false);
const idpBindingListRows = ref<PassportIdpBinding[]>([]);
const currentPassportId = ref<number | undefined>();
const openIdpBindingListDialog = async (row: Passport) => {
  currentPassportId.value = row.id;
  idpBindingListDrawerVisible.value = true;
  idpBindingListRows.value = [];
  try {
    idpBindingListRows.value = await PassportIdpBindingApi.list({ passportId: row.id });
  } catch (error: any) {
    ElMessage.error(error.message || '加载第三方绑定列表失败');
  }
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
