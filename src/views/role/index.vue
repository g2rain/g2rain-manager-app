<template>
  <div class="role-page">
    <!-- 查询表单 -->
    <el-card class="role-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="所属机构">
          <el-select v-model="queryForm.organId" placeholder="请选择所属机构" clearable style="width: 200px">
            <el-option v-for="item in organOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色类型">
          <el-select v-model="queryForm.roleType" placeholder="请选择角色类型" clearable style="width: 200px">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色名称">
          <el-input v-model="queryForm.roleName" placeholder="请输入角色名称" clearable style="width: 200px" />
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
    <div class="role-page__header">
      <div class="role-page__title-group">
        <h2>管理角色数据</h2>
      </div>
      <el-button type="primary" v-permission="'role:add'" @click="handleCreate">新增角色</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" label="角色序号" width="120" />

      <el-table-column prop="organId" label="所属机构" width="140" />

      <el-table-column prop="roleType" label="角色类型" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            {{typeOptions.find(item => item.value === row?.roleType)?.label || ''}}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="roleName" label="角色名称" width="180" />

      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />

      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />

      <el-table-column label="操作" fixed="right" width="300">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">明细</el-button>
          <el-button type="primary" v-permission="'role:edit'" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" v-permission="'role:users-assign'" link size="small"
            @click="handleAssignUsers(row)">分配用户</el-button>
          <el-button type="warning" v-permission="'role:control-utils-assign'" link size="small"
            @click="handleAssignControlUtils(row)">分配功能权限</el-button>
          <el-button type="danger" v-permission="'role:delete'" v-if="row.roleType !== 'ADMIN'" link size="small"
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
    <div class="role-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="所属机构" prop="organId">
          <el-select v-model="editForm.organId" :disabled="isEdit" placeholder="请选择所属机构" style="width: 200px">
            <el-option v-for="item in organOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" placeholder="请输入角色名称" />
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
    <el-dialog v-model="detailDialogVisible" title="角色明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="角色序号">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="所属机构">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="角色类型">
          <el-tag>
            {{typeOptions.find(item => item.value === currentRow?.roleType)?.label || ''}}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="角色名称">{{ currentRow?.roleName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配用户 -->
    <el-dialog v-model="assignUsersDialog.visible" title="分配用户" width="520px">
      <el-select-v2 
        v-model="selectedUsers" 
        :options="allUsers" 
        multiple placeholder="请选择用户" 
      />

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetAssignUsersDialog">取 消</el-button>
          <el-button type="primary" @click="assignUsers">保 存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配功能权限 -->
    <el-dialog v-model="assignControlUtilsDialog.visible" title="分配功能权限" width="600px">
      <el-transfer 
        v-model="selectedControlUtils" 
        :data="allControlUtils" 
        filterable filter-placeholder="搜索功能权限" 
        :titles="['可选功能权限', '已选功能权限']"
      />

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetAssignControlUtilsDialog">取 消</el-button>
          <el-button type="primary" @click="assignControlUtils" :disabled="assignControlUtilsDialog.isDisabled">保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { RoleApi } from './api';
import { UserApi } from '../user/api'
import { UserRoleRelationApi } from '../user-role-relation/api'
import { OrganApi } from '../organ/api';
import { RoleControlUnitRelationApi } from '../role-control-unit-relation/api'
import type { Role, RolePayload, RoleQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@/components';

// 定义字典引用
const typeOptions = ref<Array<{ label: string; value: string }>>([]);
const organOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取字典信息
const loadDicts = async () => {
  organOptions.value = (await OrganApi.searchOrgans()).map(u => ({
    value: u.organId,
    label: u.organName
  }));

  typeOptions.value = [{
    label: '超管角色',
    value: 'ADMIN'
  }, {
    label: '用户角色',
    value: 'USER'
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
  organId: undefined,
  roleType: '',
  roleName: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用  
const tableData = ref<Role[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as RoleQuery;

    // 请求分页数据
    const pageData = await RoleApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & RoleQuery);
    
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
  queryForm.organId = undefined;
  queryForm.roleType = '';
  queryForm.roleName = '';
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
const currentRow = ref<Role | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: Role) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: Role) => {
  ElMessageBox.confirm(`确认删除角色「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await RoleApi.remove(row.id);
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
  organId: undefined as number | undefined,
  roleName: '',
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请选择所属机构', trigger: 'blur' }],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.organId = undefined;
  editForm.roleName = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: Role) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.roleName = row.roleName;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: RolePayload = {
    organId: editForm.organId,
    roleName: editForm.roleName,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await RoleApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

// 分配用户弹窗引用
const assignUsersDialog = reactive({
  visible: false,
  roleId: null as number | null
})

// 分配用户组件引用
const allUsers = ref<{ value: number; label: string }[]>([])
const selectedUsers = ref<number[]>([])
// 原始已关联用户列表（用于比较删除项）
let originalUsers: Set<number> = new Set()

// 重置分配用户弹窗引用
const resetAssignUsersDialog = () => {
  // 统一重置弹窗状态，清空数据
  assignUsersDialog.visible = false
  assignUsersDialog.roleId = null
  allUsers.value = []
  selectedUsers.value = []
  originalUsers.clear()
}

// 打开分配用户弹窗
const handleAssignUsers = async (row: Role) => {
  const currentRoleId = row.id
  assignUsersDialog.roleId = currentRoleId
  assignUsersDialog.visible = true

  // 查询待选用户列表, 角色归属的机构下的所有用户集合
  allUsers.value = (await UserApi.listByRole(currentRoleId)).map(u => ({
    value: u.id,
    label: u.realName || `${u.id}`
  }));

  // 查询角色关联用户
  const associatedUsers = (await UserRoleRelationApi.list({
    roleId: currentRoleId
  })).map(u => u.userId);
  selectedUsers.value = [...associatedUsers]

  // 保存原始关联用户集合，用于删除对比
  originalUsers = new Set(associatedUsers)
};

// 提交分配用户数据
const assignUsers = async () => {
  if (!assignUsersDialog.roleId) return

  // 计算删除的用户 ID：在 originalUsers 里但不在 selectedUsers.value 中
  const userIds = selectedUsers.value.filter(id => !originalUsers.has(id))
  const deleteUserIds = [...originalUsers].filter(id => !selectedUsers.value.includes(id))

  await UserRoleRelationApi.assignUsers({
    roleId: assignUsersDialog.roleId,
    userIds,        // 新增用户集合
    deleteUserIds   // 待删用户集合
  })

  ElMessage.success('分配成功')
  resetAssignUsersDialog()
};

// 分配功能权限弹窗引用
const assignControlUtilsDialog = reactive({
  visible: false,
  roleId: null as number | null,
  isDisabled: true
})

// 分配功能权限组件引用  
const allControlUtils = ref<{ key: number; label: string, disabled: boolean }[]>([])
const selectedControlUtils = ref<number[]>([])
// 原始已关联功能权限列表（用于比较删除项）
let originalControlUtils: Set<number> = new Set()

// 重置分配功能权限弹窗引用  
const resetAssignControlUtilsDialog = () => {
  // 统一重置弹窗状态，清空数据
  assignControlUtilsDialog.visible = false
  assignControlUtilsDialog.roleId = null
  assignControlUtilsDialog.isDisabled = true
  allControlUtils.value = []
  selectedControlUtils.value = []
  originalControlUtils.clear()
}

// 打开分配功能权限弹窗
const handleAssignControlUtils = async (row: Role) => {
  const currentRoleId = row.id
  assignControlUtilsDialog.roleId = currentRoleId
  assignControlUtilsDialog.visible = true

  const _disabled_ = row.roleType === 'ADMIN';
  assignControlUtilsDialog.isDisabled = _disabled_;

  // 查询待选功能权限列表, 角色归属的机构下的超管角色拥有的功能权限集合
  allControlUtils.value = (await RoleControlUnitRelationApi.listByRole(currentRoleId)).map(u => ({
    key: u.controlUnitId,
    label: u.controlUnitName || `${u.controlUnitId}`,
    disabled: _disabled_
  }));

  // 查询角色关联功能权限
  const associatedControlUtils = (await RoleControlUnitRelationApi.list({
    roleId: currentRoleId
  })).map(u => u.controlUnitId);
  selectedControlUtils.value = [...associatedControlUtils]

  // 保存原始关联功能权限集合，用于删除对比
  originalControlUtils = new Set(associatedControlUtils)
};

// 提交分配功能权限数据
const assignControlUtils = async () => {
  if (!assignControlUtilsDialog.roleId) return

  // 计算删除的用户 ID：在 originalPermissions 里但不在 assignedKeys.value 中
  const controlUnitIds = selectedControlUtils.value.filter(id => !originalControlUtils.has(id))
  const deleteControlUnitIds = [...originalControlUtils].filter(id => !selectedControlUtils.value.includes(id))

  await RoleControlUnitRelationApi.save({
    roleId: assignControlUtilsDialog.roleId,
    controlUnitIds,       // 新增功能权限集合
    deleteControlUnitIds  // 待删功能权限集合
  })

  ElMessage.success('配置成功')
  resetAssignControlUtilsDialog()
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
.role-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.role-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.role-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-page__header h2 {
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

.role-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.role-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
