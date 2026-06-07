<template>
  <div class="user-page">
    <!-- 查询表单 -->
    <el-card class="user-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_FIELD_ORGAN', '所属机构')">
          <OrganSelect
            v-model="queryForm.organId"
            :api-method="OrganApi.searchOrgans"
            :placeholder="$t('MG_PH_ORGAN', '请选择所属机构')"
            width="200px"
          />
        </el-form-item>

        <el-form-item :label="$t('G2_FIELD_REAL_NAME', '姓名')">
          <el-input
            v-model="queryForm.realName"
            :placeholder="$t('G2_PH_REALNAME', '请输入姓名')"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item :label="$t('G2_FIELD_EMAIL', '邮箱地址')">
          <el-input
            v-model="queryForm.email"
            :placeholder="$t('G2_PH_EMAIL', '请输入邮箱地址')"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item :label="$t('G2_FIELD_MOBILE', '手机号码')">
          <el-input
            v-model="queryForm.mobile"
            :placeholder="$t('G2_PH_MOBILE', '请输入手机号码')"
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
    <div class="user-page__header">
      <div class="user-page__title-group">
        <h2>{{ $t('MG_USER_TITLE', '管理用户数据') }}</h2>
      </div>
      <el-button type="primary" v-permission="'user:add'" @click="handleCreate">
        {{ $t('MG_USER_BTN_ADD', '新增用户') }}
      </el-button>
    </div>

    <SortableTable
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :enable-multi-sort="true"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="passportId" :label="$t('MG_USER_COL_PASSPORT', '账号序号')" width="120">
        <template #default="{ row }">
          <el-button type="primary" link @click="openPassportListDialog(row)">{{ row.passportId }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="id" :label="$t('MG_USER_COL_ID', '用户序号')" width="140" />
      <el-table-column prop="organName" :label="$t('MG_FIELD_ORGAN', '所属机构')" width="140" />
      <el-table-column prop="realName" :label="$t('G2_FIELD_REAL_NAME', '姓名')" width="180" />
      <el-table-column prop="admin" :label="$t('G2_FIELD_ADMIN', '管理员')" width="140">
        <template #default="{ row }">
          <el-tag :type="row.admin ? 'success' : 'info'" effect="light">
            <DictText :value="row?.admin" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="email" :label="$t('G2_FIELD_EMAIL', '邮箱地址')" width="180" />
      <el-table-column prop="mobile" :label="$t('G2_FIELD_MOBILE', '手机号码')" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">
            {{ $t('G2_BTN_DETAIL', '明细') }}
          </el-button>
          <el-button type="primary" v-permission="'user:edit'" link size="small" @click="handleEdit(row)">
            {{ $t('G2_BTN_EDIT', '编辑') }}
          </el-button>
          <el-button
            type="danger"
            v-permission="'user:delete'"
            v-if="!row.admin"
            link
            size="small"
            @click="handleDelete(row)"
          >
            {{ $t('G2_BTN_DELETE', '删除') }}
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
    <div class="user-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="editDialogTitle" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item :label="$t('G2_FIELD_REAL_NAME', '姓名')" prop="realName">
          <el-input v-model="editForm.realName" :placeholder="$t('G2_PH_REALNAME', '请输入姓名')" />
        </el-form-item>
        <el-form-item :label="$t('G2_FIELD_EMAIL', '邮箱地址')" prop="email">
          <el-input v-model="editForm.email" :placeholder="$t('G2_PH_EMAIL', '请输入邮箱地址')" />
        </el-form-item>
        <el-form-item :label="$t('G2_FIELD_MOBILE', '手机号码')" prop="mobile">
          <el-input v-model="editForm.mobile" :placeholder="$t('G2_PH_MOBILE', '请输入手机号码')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" :title="$t('MG_USER_DETAIL', '用户明细')" width="520px">
    <!-- 明细弹窗 -->
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('MG_USER_COL_ID', '用户序号')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_FIELD_ORGAN', '所属机构')">{{ currentRow?.organName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_REAL_NAME', '姓名')">{{ currentRow?.realName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_EMAIL', '邮箱地址')">{{ currentRow?.email }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_MOBILE', '手机号码')">{{ currentRow?.mobile }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_ADMIN', '管理员')">
          <el-tag :type="currentRow?.admin ? 'success' : 'info'">
            <DictText :value="currentRow?.admin" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="passportListDialogVisible"
      :title="$t('MG_USER_PASSPORT_LIST', '账号列表')"
      width="960px"
      destroy-on-close
      @closed="passportListRows = []"
    >
    <!-- 关联账号列表 -->
      <el-table :data="passportListRows" border stripe max-height="420">
        <el-table-column prop="id" :label="$t('MG_USER_PASSPORT_ID', '账号标识')" width="120" />
        <el-table-column prop="username" :label="$t('G2_FIELD_USERNAME', '用户名')" min-width="120" />
        <el-table-column prop="realName" :label="$t('G2_FIELD_REAL_NAME', '姓名')" width="120" />
        <el-table-column prop="status" :label="$t('MG_USER_PASSPORT_STATUS', '账号状态')" width="100">
          <template #default="{ row: p }">
            <DictText :value="p.status" usage-code="PASSPORT_STATUS" :api-method="DictItemApi.select" />
          </template>
        </el-table-column>
        <el-table-column prop="mobile" :label="$t('G2_FIELD_MOBILE', '手机号码')" width="140" />
        <el-table-column prop="email" :label="$t('G2_FIELD_EMAIL', '邮箱地址')" min-width="160" />
        <el-table-column prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="170" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="passportListDialogVisible = false">
          {{ $t('G2_BTN_CLOSE', '关闭') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { UserApi } from './api';
import { PassportApi } from '../passport/api';
import { OrganApi } from '../organ/api';
import { DictItemApi } from '../dict/api';
import type { User, UserPayload, UserQuery } from './type';
import type { Passport } from '../passport/type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, OrganSelect, DictText } from '@/components';

  // 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

  // 基础查询状态（使用 ref，便于 v-model 替换整个对象时保持响应式）
let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

  // 业务查询状态
const queryForm = reactive({
  passportId: undefined,
  organId: undefined,
  realName: '',
  email: '',
  mobile: '',
});

  // 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

  // 定义列表引用
const tableData = ref<User[]>([]);

  // 加载列表数据
const loadData = async () => {
  try {
      // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm }).filter(
        ([_, v]) => (v ?? '') !== '' && [v].flat().length,
      ),
    ) as UserQuery;

      // 请求分页数据
    const pageData = await UserApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & UserQuery);

      // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    ElMessage.error(msg);
  }
  // 表单校验规则
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
  queryForm.passportId = undefined;
  queryForm.organId = undefined;
  queryForm.realName = '';
  queryForm.email = '';
  queryForm.mobile = '';
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
const currentRow = ref<User | null>(null);
  // 明细弹窗引用
const detailDialogVisible = ref(false);

  // 查询数据明细  
const handleView = (row: User) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

  // 删除数据记录
const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    t('MG_USER_DEL_CONFIRM', `确认删除用户「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await UserApi.remove(row.id);
          // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败');
        ElMessage.error(msg);
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
  realName: '',
  email: '',
  mobile: '',
});

const editDialogTitle = computed(() =>
  isEdit.value ? t('MG_USER_DLG_EDIT', '编辑用户') : t('MG_USER_DLG_ADD', '新增用户'),
);

const editRules = computed<FormRules>(() => ({
  realName: [{ required: true, message: t('G2_VLD_REQ_REALNAME', '请输入姓名'), trigger: 'blur' }],
  email: [{ required: false, message: t('G2_PH_EMAIL', '请输入邮箱地址'), trigger: 'blur' }],
  mobile: [{ required: false, message: t('G2_PH_MOBILE', '请输入手机号码'), trigger: 'blur' }],
}));

  // 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();
  editForm.id = undefined;
  editForm.realName = '';
  editForm.email = '';
  editForm.mobile = '';
  editDialogVisible.value = true;
};

 // 打开修改弹窗
const handleEdit = (row: User) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();
  editForm.id = row.id;
  editForm.realName = row.realName;
  editForm.email = row.email;
  editForm.mobile = row.mobile;
  editDialogVisible.value = true;
};

  // 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: UserPayload = {
    realName: editForm.realName,
    email: editForm.email,
    mobile: editForm.mobile,
  };

  try {
      // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await UserApi.save(payload);
    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    // 查询列表
    await loadData();
    editDialogVisible.value = false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
    ElMessage.error(msg);
  }
};

  // 查看账号列表
const passportListDialogVisible = ref(false);
const passportListRows = ref<Passport[]>([]);

const openPassportListDialog = async (row: User) => {
  passportListDialogVisible.value = true;
  passportListRows.value = [];
  try {
    if (row.passportId != null) {
      passportListRows.value = await PassportApi.list({ id: row.passportId });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('MG_USER_PASSPORT_LOAD_FAIL', '加载账号列表失败');
    ElMessage.error(msg);
  }
};

  // 挂载回调
onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.user-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.user-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.user-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-page__header h2 {
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

.user-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.user-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
