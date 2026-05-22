<template>
  <div class="application-page">
    <!-- 查询表单 -->
    <el-card class="application-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="所属机构">
          <OrganSelect v-model="queryForm.organId" :api-method="OrganApi.searchOrgans" placeholder="请选择所属机构" width="200px" />
        </el-form-item>

        <el-form-item label="应用类型">
          <DictSelect v-model="queryForm.applicationType" usage-code="APPLICATION_TYPE" :api-method="DictItemApi.select" placeholder="请选择应用类型" />
        </el-form-item>

        <el-form-item label="应用名称">
          <el-input v-model="queryForm.applicationName" placeholder="请输入应用名称" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="应用编码">
          <el-input v-model="queryForm.applicationCode" placeholder="请输入应用编码" clearable style="width: 200px" />
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
    <div class="application-page__header">
      <div class="application-page__title-group">
        <h2>管理应用数据</h2>
      </div>
      <el-button type="primary" v-permission="'application:add'" @click="handleCreate">新增应用</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" label="应用标识" width="140" />
      <el-table-column prop="organName" label="所属机构" width="140" />

      <el-table-column prop="applicationType" label="应用类型" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.applicationType" usage-code="APPLICATION_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="applicationName" label="应用名称" width="180" />

      <el-table-column prop="applicationCode" label="应用编码" width="180" />

      <el-table-column prop="status" label="应用状态" width="180">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            permission="application:status_update"
            active-value="PUBLISHED"
            inactive-value="UNPUBLISHED"
            :options="statusOptions"
            :api-method="({ nextValue }) => ApplicationApi.updateStatus(row.id, String(nextValue))"
            @success="loadData"
          />
        </template>
      </el-table-column>

      <el-table-column prop="canIntegrate" label="支持集成" width="140">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.canIntegrate" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>

      <TableColumn prop="createTime" label="创建时间" width="180" :sortable="true" />

      <TableColumn prop="updateTime" label="更新时间" width="180" :sortable="true" />

      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">明细</el-button>
          <el-button type="primary" v-permission="'application:edit'" link size="small"
            @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" v-permission="'application:integrate'" link size="small"
            v-if="row.canIntegrate" @click="handleIntegrate(row)">关联应用</el-button>
          <el-button type="success" link size="small" v-permission="'application:public_key_config'"
            @click="handlePubKeyConfig(row)">公钥配置</el-button>
          <el-button type="danger" v-permission="'application:delete'" v-if="!row.landing" link size="small"
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
    <div class="application-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑应用' : '新增应用'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="150px">
        <el-form-item label="所属机构" prop="organId">
          <OrganSelect v-model="editForm.organId" :disabled="isEdit" :api-method="OrganApi.searchOrgans" placeholder="请选择所属机构" width="200px" />
        </el-form-item>

        <el-form-item label="应用类型" prop="applicationType">
          <DictSelect v-model="editForm.applicationType" usage-code="APPLICATION_TYPE" :api-method="DictItemApi.select" :clearable="false" placeholder="请选择应用类型" />
        </el-form-item>

        <el-form-item label="支持集成" prop="canIntegrate">
          <el-radio-group v-model="editForm.canIntegrate">
            <el-radio v-for="option in boolOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="支持API密钥" prop="apiKeySupported">
          <el-radio-group v-model="editForm.apiKeySupported">
            <el-radio v-for="option in boolOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="应用名称" prop="applicationName">
          <el-input v-model="editForm.applicationName" placeholder="请输入应用名称" />
        </el-form-item>

        <el-form-item label="应用编码" prop="applicationCode">
          <el-input v-model="editForm.applicationCode" placeholder="请输入应用编码" />
        </el-form-item>

        <el-form-item label="访问令牌有效期(秒)" prop="accessTokenExpiresIn">
          <el-input-number v-model="editForm.accessTokenExpiresIn" :min="0" :step="1" placeholder="访问令牌有效期 (秒)" />
        </el-form-item>

        <el-form-item label="刷新令牌有效期(秒)" prop="refreshTokenExpiresIn">
          <el-input-number v-model="editForm.refreshTokenExpiresIn" :min="0" :step="1" placeholder="刷新令牌有效期 (秒)" />
        </el-form-item>

        <el-form-item label="应用地址" prop="endpointUrl">
          <el-input v-model="editForm.endpointUrl" placeholder="请输入应用地址" />
        </el-form-item>

        <el-form-item label="应用路径" prop="contextPath">
          <el-input v-model="editForm.contextPath" placeholder="请输入应用路径" />
        </el-form-item>

        <el-form-item label="备注" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="4" placeholder="请输入备注信息" show-word-limit
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
    <el-dialog v-model="detailDialogVisible" title="应用明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="所属机构">{{ currentRow?.organName }}</el-descriptions-item>
        <el-descriptions-item label="应用类型">
          <DictText :value="currentRow?.applicationType" usage-code="APPLICATION_TYPE" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item label="支持集成">
          <el-tag :type="currentRow?.canIntegrate ? 'success' : 'info'">
            <DictText :value="currentRow?.canIntegrate" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支持API密钥">
          <el-tag :type="currentRow?.apiKeySupported ? 'success' : 'info'">
            <DictText :value="currentRow?.apiKeySupported" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ currentRow?.applicationName }}</el-descriptions-item>
        <el-descriptions-item label="应用编码">{{ currentRow?.applicationCode }}</el-descriptions-item>
        <el-descriptions-item label="应用状态">
          <el-tag>
            <DictText :value="currentRow?.status" usage-code="APPLICATION_STATUS" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="访问令牌有效期(秒)">{{ currentRow?.accessTokenExpiresIn }}</el-descriptions-item>
        <el-descriptions-item label="刷新令牌有效期(秒)">{{ currentRow?.refreshTokenExpiresIn }}</el-descriptions-item>
        <el-descriptions-item label="应用地址">{{ currentRow?.endpointUrl }}</el-descriptions-item>
        <el-descriptions-item label="应用路径">{{ currentRow?.contextPath }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentRow?.description }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关联主应用弹窗 -->
    <el-dialog v-model="integrateDialog.visible" :title="'关联应用'" width="520px">
      <el-checkbox-group v-model="selectedApplications" class="checkbox-grid">
        <el-checkbox v-for="item in mainApplications" :key="item.value" :value="item.value" size="small">
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetIntegrateDialog">取 消</el-button>
          <el-button type="primary" @click="submitIntegrate">保 存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 公钥配置 -->
    <el-dialog v-model="pubKeyConfigDialog.visible" title="公钥配置" width="520px">
      <el-form :model="pubKeyForm" label-width="100px">
        <!-- 公钥算法（仅上传时需要） -->
        <el-form-item label="公钥算法">
          <DictSelect v-model="pubKeyForm.algorithm" usage-code="KEY_ALGORITHM" :api-method="DictItemApi.select" :clearable="false" placeholder="请选择算法" />
        </el-form-item>

        <!-- 当前公钥状态 + 下载 -->
        <el-form-item label="当前公钥">
          <el-space>
            <el-tag v-if="pubKeyConfigDialog.hasPublicKey" type="success">已配置</el-tag>
            <el-tag v-else type="info">未配置</el-tag>
            <el-button v-if="pubKeyConfigDialog.hasPublicKey" type="primary" link @click="downloadPublicKey">
              下载公钥
            </el-button>
          </el-space>
        </el-form-item>

        <!-- 上传公钥 -->
        <el-form-item label="上传公钥">
          <el-upload :auto-upload="false" :limit="1" accept=".pem,.der" :on-change="handlePubKeyFileChange">
            <el-button>选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="pubKeyConfigDialog.visible = false">取消</el-button>
        <el-button type="primary" :disabled="!pubKeyForm.file" @click="submitPublicKey">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules, UploadFile } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ApplicationApi } from './api';
import { OrganApi } from '../organ/api';
import { DictItemApi, parseDictCodeAsBoolean } from '../dict/api';
import { ApplicationSuiteApi } from '../application_suite/api'
import type { Application, ApplicationPayload, ApplicationQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, OrganSelect, DictSelect, DictText, StatusSwitch } from '@/components';

// 定义字典引用
const statusOptions = ref<Array<{ label: string; value: string }>>([]);
const boolOptions = ref<Array<{ label: string; value: boolean }>>([]);

// 获取字典信息
const loadDicts = async () => {
  try {
    const items = await DictItemApi.loadByUsageCode('APPLICATION_STATUS');
    statusOptions.value = [...items]
      .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
      .map((item) => ({
        label: item.name || String(item.code),
        value: String(item.code),
      }));
  } catch (error) {
    console.error('加载应用状态字典失败:', error);
    statusOptions.value = [];
  }

  try {
    const items = await DictItemApi.loadByUsageCode('BOOLEAN_FLAG');
    boolOptions.value = [...items]
      .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
      .map((item) => {
        const value = parseDictCodeAsBoolean(String(item.code));
        if (value === undefined) return null;
        return {
          label: item.name || String(item.code),
          value,
        };
      })
      .filter((item): item is { label: string; value: boolean } => item !== null);
  } catch (error) {
    console.error('加载布尔字典失败:', error);
    boolOptions.value = [];
  }
};

// 基础查询状态（使用 reactive 以确保 v-model 的双向绑定完全生效）
let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  organId: undefined,
  applicationType: '',
  applicationName: '',
  applicationCode: '',
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
const tableData = ref<Application[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ApplicationQuery;

    // 请求分页数据
    const pageData = await ApplicationApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ApplicationQuery);
    
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
  queryForm.organId = undefined;
  queryForm.applicationName = '';
  queryForm.applicationCode = '';
  queryForm.applicationType = '';
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
const currentRow = ref<Application | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: Application) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: Application) => {
  ElMessageBox.confirm(`确认删除应用「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ApplicationApi.remove(row.id);
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
  applicationType: 'SYSTEM',
  applicationName: '',
  applicationCode: '',
  canIntegrate: true,
  apiKeySupported: false,
  accessTokenExpiresIn: undefined as number | undefined,
  refreshTokenExpiresIn: undefined as number | undefined,
  endpointUrl: '',
  contextPath: '',
  description: '',
});

// 表单校验规则 
const editRules: FormRules = {
  organId: [{ required: true, message: '请选择所属机构', trigger: 'blur' }],
  applicationType: [{ required: true, message: '请选择应用类型', trigger: 'blur' }],
  applicationName: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  applicationCode: [{ required: false, message: '请输入应用编码', trigger: 'blur' }],
  canIntegrate: [{ required: true, message: '请选择支持集成', trigger: 'blur' }],
  apiKeySupported: [{ required: true, message: '请选择是否支持API密钥', trigger: 'blur' }],
  accessTokenExpiresIn: [{ required: true, message: '请输入访问令牌有效期', trigger: 'blur' }],
  refreshTokenExpiresIn: [{ required: true, message: '请输入刷新令牌有效期', trigger: 'blur' }],
  endpointUrl: [{ required: true, message: '请输入应用地址', trigger: 'blur' }],
  contextPath: [{ required: false, message: '请输入应用路径', trigger: 'blur' }],
  description: [{ required: false, message: '请输入应用路径', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.organId = undefined;
  editForm.applicationType = 'SYSTEM';
  editForm.applicationName = '';
  editForm.applicationCode = '';
  editForm.canIntegrate = true;
  editForm.apiKeySupported = false;
  editForm.accessTokenExpiresIn = 3600;
  editForm.refreshTokenExpiresIn = 86400;
  editForm.endpointUrl = '';
  editForm.contextPath = '';
  editForm.description = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: Application) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.applicationType = row.applicationType;
  editForm.applicationName = row.applicationName;
  editForm.applicationCode = row.applicationCode;
  editForm.canIntegrate = row.canIntegrate;
  editForm.apiKeySupported = row.apiKeySupported;
  editForm.accessTokenExpiresIn = row.accessTokenExpiresIn;
  editForm.refreshTokenExpiresIn = row.refreshTokenExpiresIn;
  editForm.endpointUrl = row.endpointUrl;
  editForm.contextPath = row.contextPath;
  editForm.description = row.description;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ApplicationPayload = {
    organId: editForm.organId,
    applicationName: editForm.applicationName,
    applicationCode: editForm.applicationCode,
    canIntegrate: editForm.canIntegrate,
    apiKeySupported: editForm.apiKeySupported,
    applicationType: editForm.applicationType,
    accessTokenExpiresIn: editForm.accessTokenExpiresIn,
    refreshTokenExpiresIn: editForm.refreshTokenExpiresIn,
    endpointUrl: editForm.endpointUrl,
    contextPath: editForm.contextPath,
    description: editForm.description,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ApplicationApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

// 关联应用组件引用  
const mainApplications = ref<{ value: number; label: string }[]>([])
const selectedApplications = ref<number[]>([])
// 原始已关联应用列表（用于比较删除项）
let originalApplications: Set<number> = new Set()

const integrateDialog = reactive({
  visible: false,
  applicationId: null as number | null
})

const resetIntegrateDialog = () => {
  // 统一重置弹窗状态，清空数据
  integrateDialog.visible = false
  integrateDialog.applicationId = null
  mainApplications.value = []
  selectedApplications.value = []
  originalApplications.clear()
}

const handleIntegrate = async (row: Application) => {
  const currentApplicationId = row.id
  integrateDialog.applicationId = currentApplicationId
  integrateDialog.visible = true

  // 查询待选应用列表
  mainApplications.value = (await ApplicationApi.id2name({ canIntegrate: false })).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));

  // 查询角色关联应用
  const associatedApplications = (await ApplicationSuiteApi.list({
    applicationId: currentApplicationId
  })).map(u => u.masterApplicationId);
  selectedApplications.value = [...associatedApplications]

  // 保存原始关联应用集合，用于删除对比
  originalApplications = new Set(associatedApplications)
};

const submitIntegrate = async () => {
  if (!integrateDialog.applicationId) return

  // 计算删除的用户 ID：在 originalAssignedKey 里但不在 assignedKeys.value 中
  const masterApplicationIds = selectedApplications.value.filter(id => !originalApplications.has(id))                 // 新增
  const deleteMasterApplicationIds = [...originalApplications].filter(id => !selectedApplications.value.includes(id)) // 删除

  await ApplicationSuiteApi.save({
    applicationId: integrateDialog.applicationId,
    masterApplicationIds,         // 新增应用
    deleteMasterApplicationIds    // 待删应用
  })

  ElMessage.success('关联成功')
  resetIntegrateDialog()
};

// ========================
// Dialog 状态
// ========================
const pubKeyConfigDialog = reactive({
  visible: false,
  applicationId: null as number | null,
  hasPublicKey: false
})

// ========================
// 表单数据
// ========================
const pubKeyForm = reactive({
  algorithm: '',
  file: null as File | null
})

const handlePubKeyConfig = async (row: Application) => {
  pubKeyConfigDialog.visible = true;
  pubKeyConfigDialog.applicationId = row.id;
  pubKeyConfigDialog.hasPublicKey = (await ApplicationApi.hasPublicKey(row.id));
  pubKeyForm.algorithm = 'EC';
  pubKeyForm.file = null;
}

// ========================
// 文件选择
// ========================
const handlePubKeyFileChange = (uploadFile: UploadFile) => {
  // uploadFile 是 Element Plus 封装的对象
  // uploadFile.raw 才是浏览器原生的 File 对象
  pubKeyForm.file = uploadFile?.raw || null;
};

// ========================
// 提交上传
// ========================
const submitPublicKey = async () => {
  if (!pubKeyConfigDialog.applicationId) {
    ElMessage.error('应用ID不存在')
    return
  }

  if (!pubKeyForm.file) {
    ElMessage.error('请选择公钥文件')
    return
  }

  const formData = new FormData();
  formData.append('publicKeyAlgorithm', pubKeyForm.algorithm);
  formData.append('file', pubKeyForm.file);
  await ApplicationApi.uploadPublicKey(pubKeyConfigDialog.applicationId, formData);
  ElMessage.success('公钥上传成功');
  pubKeyConfigDialog.visible = false;
}

// ========================
// 下载公钥（不关心算法）
// ========================
const downloadPublicKey = () => {
  if (!pubKeyConfigDialog.applicationId) {
    return
  }

  ApplicationApi.downloadPublicKey(pubKeyConfigDialog.applicationId)
}

// 挂载回调
onMounted(async () => {
  // 先准备字典
  await loadDicts();
  // 再查询列表
  await loadData();
});
</script>

<style scoped>
.application-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.application-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.application-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.application-page__header h2 {
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

.application-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.application-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
