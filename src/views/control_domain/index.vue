<template>
  <div class="control-domain-page">
    <!-- 查询表单 -->
    <el-card class="control-domain-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="所属应用">
          <el-select v-model="queryForm.applicationId" placeholder="请选择所属应用" clearable style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="业务能力类型">
          <DictSelect v-model="queryForm.controlDomainType" usage-code="CONTROL_DOMAIN_TYPE" :api-method="DictItemApi.select" placeholder="请选择业务能力类型"/>
        </el-form-item>

        <el-form-item label="业务能力名称">
          <el-input v-model="queryForm.controlDomainName" placeholder="请输入业务能力名称" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="业务能力范围">
          <DictSelect v-model="queryForm.controlDomainScope" usage-code="CONTROL_DOMAIN_SCOPE" :api-method="DictItemApi.select" placeholder="请选择业务能力范围"/>
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
    <div class="control-domain-page__header">
      <div class="control-domain-page__title-group">
        <h2>管理业务能力数据</h2>
      </div>
      <el-button type="primary" v-permission="'control_domain:add'" @click="handleCreate">新增业务能力</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" label="业务能力序号" width="120" />
      <el-table-column prop="applicationId" label="所属应用" width="140" />
      <el-table-column prop="controlDomainType" label="业务能力类型" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.controlDomainType" usage-code="CONTROL_DOMAIN_TYPE" :api-method="DictItemApi.select"/>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="controlDomainName" label="业务能力名称" width="180" />
      <el-table-column prop="controlDomainScope" label="业务能力范围" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.controlDomainScope" usage-code="CONTROL_DOMAIN_SCOPE" :api-method="DictItemApi.select"/>
          </el-tag>
        </template>
      </el-table-column>
      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />
      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />
      <el-table-column label="操作" fixed="right" width="300">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">明细</el-button>
          <el-button type="primary" v-permission="'control_domain:edit'" link size="small"
            @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" v-permission="'control_domain:control_utils_associate'" link size="small"
            @click="handleAssociateControlUtils(row)">关联功能权限</el-button>
          <el-button type="warning" v-permission="'control_domain:features_activate'" link size="small"
            @click="handleActivateFeatures(row)">开通功能</el-button>
          <el-button type="danger" v-permission="'control_domain:delete'" link size="small"
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
    <div class="control-domain-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑业务能力' : '新增业务能力'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="150px">
        <el-form-item label="所属应用" prop="applicationId">
          <el-select v-model="editForm.applicationId" :disabled="isEdit" placeholder="请选择所属应用" style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="业务能力类型" prop="controlDomainType">
          <DictSelect 
            v-model="editForm.controlDomainType" 
            usage-code="CONTROL_DOMAIN_TYPE" 
            :disabled="isEdit" 
            :api-method="DictItemApi.select" 
            :clearable="false"
            placeholder="请选择业务能力类型"
          />
        </el-form-item>

        <el-form-item label="业务能力名称" prop="controlDomainName">
          <el-input v-model="editForm.controlDomainName" placeholder="请输入业务能力名称"  style="width: 200px"/>
        </el-form-item>

        <el-form-item label="业务能力范围" prop="controlDomainScope">
          <DictSelect
            :key="editForm.controlDomainType || '_empty'"
            v-model="editForm.controlDomainScope"
            usage-code="CONTROL_DOMAIN_SCOPE"
            :disabled="isEdit"
            :api-method="selectControlDomainScope"
            :clearable="false"
            placeholder="请选择业务能力范围"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="4" placeholder="请输入描述" show-word-limit
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
    <el-dialog v-model="detailDialogVisible" title="业务能力明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="业务能力序号">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="所属应用">{{ currentRow?.applicationId }}</el-descriptions-item>
        <el-descriptions-item label="业务能力类型">
          <el-tag>
            <DictText :value="currentRow?.controlDomainType" usage-code="CONTROL_DOMAIN_TYPE" :api-method="DictItemApi.select"/>
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="业务能力名称">{{ currentRow?.controlDomainName }}</el-descriptions-item>
        <el-descriptions-item label="业务能力范围">
          <el-tag>
            <DictText :value="currentRow?.controlDomainScope" usage-code="CONTROL_DOMAIN_SCOPE" :api-method="DictItemApi.select"/>
          </el-tag>
        </el-descriptions-item>
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

    <!-- 关联功能权限 -->
    <el-dialog v-model="associateControlUtilsDialog.visible" title="关联功能权限" width="600px">
      <el-table :data="associateControlUtilsDialog.tableData" border>
        <!-- 多选框列 -->
        <el-table-column width="100">
          <template #default="{ row }">
            <el-checkbox v-model="associateControlUtilsDialog.checkedIds" :label="row.id" />
          </template>
        </el-table-column>
        <!-- 业务展示列 -->
        <el-table-column prop="controlUnitName" label="功能权限名称" />
        <el-table-column prop="controlUnitScope" label="功能权限范围" />
      </el-table>

      <template #footer>
        <el-button @click="resetAssociateControlUtilsDialog">取 消</el-button>
        <el-button type="primary" @click="associateControlUtils">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 开通功能 -->
    <el-dialog v-model="activateFeaturesDialog.visible" title="开通功能" width="600px">
      <OrganSelect v-model="activateFeaturesDialog.organId" :api-method="OrganApi.searchOrgans" placeholder="请选择所属机构" width="200px" />
      <template #footer>
        <el-button @click="resetActivateFeaturesDialogDialog">取 消</el-button>
        <el-button type="primary" @click="activateFeatures">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ControlDomainApi } from './api';
import { ControlUnitApi } from '../control_unit/api'
import { ApplicationApi } from '../application/api';
import { OrganApi } from '../organ/api';
import { DictItemApi } from '../dict/api';
import { ApplicationAuthorizationApi } from '../application_authorization/api'
import { ControlDomainControlUnitRelationApi } from '../control_domain_control_unit_relation/api'
import type { ControlDomain, ControlDomainPayload, ControlDomainQuery } from './type';
import type { ControlUnit } from '../control_unit/type'
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, OrganSelect, DictSelect, DictText } from '@/components';

// 定义字典引用
const applicationOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取字典信息
const loadDicts = async () => {
  applicationOptions.value = (await ApplicationApi.id2name()).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));
};

// 基础查询状态（使用 reactive v-model 替换整个对象时保持响应式）
let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  applicationId: undefined,
  controlDomainType: '',
  controlDomainName: '',
  controlDomainScope: '',
});

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ControlDomain[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ControlDomainQuery;

    // 请求分页数据
    const pageData = await ControlDomainApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ControlDomainQuery);

    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: any) {
    ElMessage.error(error.message || '加载列表失败');
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
  queryForm.applicationId = undefined;
  queryForm.controlDomainName = '';
  queryForm.controlDomainType = '';
  queryForm.controlDomainScope = '';
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
const currentRow = ref<ControlDomain | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ControlDomain) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ControlDomain) => {
  ElMessageBox.confirm(`确认删除业务能力「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ControlDomainApi.remove(row.id);
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
  controlDomainType: '',
  controlDomainName: '',
  controlDomainScope: '',
  description: '',
});

// 表单校验规则
const editRules: FormRules = {
  applicationId: [{ required: true, message: '请选择所属应用', trigger: 'blur' }],
  controlDomainName: [{ required: true, message: '请输入业务能力名称', trigger: 'blur' }],
  controlDomainType: [{ required: true, message: '请选择业务能力类型', trigger: 'blur' }],
  controlDomainScope: [{ required: true, message: '请选择业务能力范围', trigger: 'blur' }],
  description: [{ required: false, message: '请输入描述', trigger: 'blur' }],
};

/** 类型为 TRADE 时，范围仅允许 CUSTOMER */
const TRADE_SCOPE_CODE = 'CUSTOMER';

const selectControlDomainScope = async (params: Parameters<typeof DictItemApi.select>[0]) => {
  const domainType = editForm.controlDomainType;

  const options = await DictItemApi.select({
    ...params,
    usageCode: params.usageCode ?? 'CONTROL_DOMAIN_SCOPE',
  });

  if (domainType === 'TRADE') {
    return options.filter((item) => String(item.code) === TRADE_SCOPE_CODE);
  }
  // 未选类型或 APPLICATION 等：展示全部，由 watch 在选定 TRADE 时扶正 scope
  return options;
};

/** 类型变更时联动范围：TRADE 固定为 CUSTOMER；APPLICATION 等保留已选或重新选择 */
watch(
  () => editForm.controlDomainType,
  (newType) => {
    if (newType === 'TRADE' && editForm.controlDomainScope !== TRADE_SCOPE_CODE) {
      editForm.controlDomainScope = TRADE_SCOPE_CODE;
    }
  },
);

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined as number | undefined;
  editForm.applicationId = undefined as number | undefined;
  editForm.controlDomainType = '';
  editForm.controlDomainName = '';
  editForm.controlDomainScope = '';
  editForm.description = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ControlDomain) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.applicationId = row.applicationId;
  editForm.controlDomainType = row.controlDomainType;
  editForm.controlDomainName = row.controlDomainName;
  editForm.controlDomainScope = row.controlDomainScope;
  editForm.description = row.description;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ControlDomainPayload = {
    applicationId: editForm.applicationId,
    controlDomainType: editForm.controlDomainType,
    controlDomainName: editForm.controlDomainName,
    controlDomainScope: editForm.controlDomainScope,
    description: editForm.description,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ControlDomainApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

// 关联功能权限弹窗引用
const associateControlUtilsDialog = reactive({
  visible: false,
  controlDomainId: null as number | null,
  tableData: [] as ControlUnit[], // 弹窗列表
  originIds: [] as number[],      // 打开弹窗时已选功能权限 id
  checkedIds: [] as number[],     // 勾选后的功能权限 id
})

// 重置关联功能权限弹窗引用
const resetAssociateControlUtilsDialog = () => {
  // 统一重置弹窗状态，清空数据
  associateControlUtilsDialog.visible = false
  associateControlUtilsDialog.controlDomainId = null
  associateControlUtilsDialog.tableData = []
  associateControlUtilsDialog.originIds = []
  associateControlUtilsDialog.checkedIds = []
}

// 打开关联功能权限弹窗
const handleAssociateControlUtils = async (row: ControlDomain) => {
  const currentControlDomainId = row.id
  associateControlUtilsDialog.controlDomainId = currentControlDomainId
  associateControlUtilsDialog.visible = true

  // 拉取功能权限列表
  const pageData = await ControlUnitApi.list({
    status: 'PUBLISHED',
    applicationId: row.applicationId,
    includeControlUnitScopes: row.controlDomainScope === 'CUSTOMER' ? ['CUSTOMER', 'PERPETUAL'] : undefined
  })

  associateControlUtilsDialog.tableData = pageData

  // 回显已选功能权限
  const associatedControlUnits = (await ControlDomainControlUnitRelationApi.list({
    controlDomainId: currentControlDomainId
  })).map(u => u.controlUnitId);
  associateControlUtilsDialog.originIds = [...associatedControlUnits]

  // 保存原始关联功能权限集合，用于删除对比
  associateControlUtilsDialog.checkedIds = [...associateControlUtilsDialog.originIds]
};

// 提交关联功能权限数据
const associateControlUtils = async () => {
  if (!associateControlUtilsDialog.controlDomainId) return

  const { originIds, checkedIds } = associateControlUtilsDialog
  const addIds = checkedIds.filter(id => !originIds.includes(id))
  const deleteControlUnitIds = originIds.filter(id => !checkedIds.includes(id))

  await ControlDomainControlUnitRelationApi.save({
    controlDomainId: associateControlUtilsDialog.controlDomainId,
    controlUnitIds: addIds,   // 新增功能权限
    deleteControlUnitIds      // 待删功能权限
  })

  ElMessage.success('配置成功')
  resetAssociateControlUtilsDialog()
};

// 开通功能弹窗引用
const activateFeaturesDialog = reactive({
  visible: false,                             // 弹窗显示状态
  organId: null as number | null,             // 用户在下拉框选中的机构 ID
  applicationId: null as number | null,       // 当前记录的业务能力所属应用 ID
  controlDomainId: null as number | null,     // 当前记录的业务能力 ID
});

// 重置开通功能弹窗引用
const resetActivateFeaturesDialogDialog = () => {
  // 统一重置弹窗状态，清空数据
  activateFeaturesDialog.visible = false
  activateFeaturesDialog.organId = null
  activateFeaturesDialog.applicationId = null
  activateFeaturesDialog.controlDomainId = null
}

// 打开开通功能弹窗弹窗
const handleActivateFeatures = async (row: ControlDomain) => {
  activateFeaturesDialog.controlDomainId = row.id
  activateFeaturesDialog.applicationId = row.applicationId
  activateFeaturesDialog.visible = true
};

// 提交开通功能数据
const activateFeatures = async () => {
  if (!activateFeaturesDialog.organId) {
    ElMessage.error('请选择机构');
    return
  }

  if (!activateFeaturesDialog.controlDomainId || !activateFeaturesDialog.applicationId) return

  const { organId, applicationId, controlDomainId } = activateFeaturesDialog
  await ApplicationAuthorizationApi.save({
    organId,
    controlDomainId,
    applicationId,
  })

  ElMessage.success('配置成功')
  resetActivateFeaturesDialogDialog()
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
.control-domain-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.control-domain-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.control-domain-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-domain-page__header h2 {
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

.control-domain-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.control-domain-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>