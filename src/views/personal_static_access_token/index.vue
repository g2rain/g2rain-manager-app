
<template>
  <div class="personal_static_access_token-page" :class="{ 'personal_static_access_token-page--embedded': embedded }">
    <!-- 查询表单 -->
    <el-card v-if="!embedded" class="personal_static_access_token-page__search" shadow="never">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <!-- 业务特定查询字段 -->
        <el-form-item label="名称">
          <el-input v-model="queryForm.name" placeholder="请输入名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="queryForm.status" placeholder="请输入状态" clearable style="width: 200px" />
        </el-form-item>
        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="personal_static_access_token-page__header">
      <div class="personal_static_access_token-page__title-group">
        <h2>模型秘钥管理</h2>
      </div>
      <el-button type="primary" v-permission="'personal_static_access_token:add'" @click="handleCreate">新增</el-button>
    </div>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="applicationName" label="应用名称" width="140" />
      <el-table-column prop="organName" label="机构名称" width="140" />
      <el-table-column prop="userName" label="用户名称" width="140" />
      <el-table-column prop="name" label="访问令牌名称" width="180" />
      <el-table-column prop="maskedToken" label="脱敏令牌" width="180" />
      <el-table-column prop="status" label="状态" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">明细</el-button>
          <el-button type="primary" v-permission="'personal_static_access_token:edit'" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" v-permission="'personal_static_access_token:delete'" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="personal_static_access_token-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑' : '创建'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name" placeholder="test" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">{{ isEdit ? '保 存' : '创建' }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- API key 创建结果弹窗 -->
    <el-dialog v-model="apiKeyDialogVisible" title="创建" width="560px" :close-on-click-modal="false" :close-on-press-escape="false">
      <p class="api-key-dialog__tips">
        请将此APIkey保存在安全且易于访问的地方。出于安全原因，你将无法通过 API keys管理界面再次查看它。如果你丢失了这个key，将需要重新创建。
      </p>
      <el-input v-model="createdApiKey" readonly />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeApiKeyDialog">关闭</el-button>
          <el-button type="primary" @click="copyApiKey">复制</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 明细弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="模型秘钥明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ currentRow?.applicationName }}</el-descriptions-item>
        <el-descriptions-item label="机构名称">{{ currentRow?.organName }}</el-descriptions-item>
        <el-descriptions-item label="用户名称">{{ currentRow?.userName }}</el-descriptions-item>
        <el-descriptions-item label="访问令牌名称">{{ currentRow?.name }}</el-descriptions-item>
        <el-descriptions-item label="脱敏令牌">{{ currentRow?.maskedToken }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentRow?.status }}</el-descriptions-item>
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
import { ref, reactive, onMounted, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { sha256 } from 'js-sha256';
import { PersonalStaticAccessTokenApi } from './api';
import type { PersonalStaticAccessToken, PersonalStaticAccessTokenPayload, PersonalStaticAccessTokenQuery } from './type';
import type { ApplicationAuthorization } from '../application_authorization/type';
import type { PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, showErrorMessage } from '@/components';

const props = withDefaults(defineProps<{
  embedded?: boolean;
  applicationAuthorization?: ApplicationAuthorization | null;
}>(), {
  embedded: false,
  applicationAuthorization: null,
});

const embedded = props.embedded;

// 业务查询状态
const queryForm = reactive({
  applicationAuthorizationId: undefined as number | undefined,
  name: '',
  status: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<PersonalStaticAccessToken[]>([]);

const syncApplicationAuthorizationQuery = () => {
  queryForm.applicationAuthorizationId = props.applicationAuthorization?.id;
};

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as PersonalStaticAccessTokenQuery;
  
    // 请求分页数据
    const pageData = await PersonalStaticAccessTokenApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & PersonalStaticAccessTokenQuery);
      
    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: any) {
    showErrorMessage(error || '加载列表失败');
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
  queryForm.applicationAuthorizationId = undefined;
  queryForm.name = '';
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

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<PersonalStaticAccessToken | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细  
const handleView = (row: PersonalStaticAccessToken) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: PersonalStaticAccessToken) => {
  ElMessageBox.confirm(`确认删除个人静态访问令牌「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await PersonalStaticAccessTokenApi.remove(row.id);
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
  applicationAuthorizationId: undefined as number | undefined,
  name: '',
  tokenHash: '',
  maskedToken: '',
});

// 表单校验规则
const editRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();
  
  editForm.applicationAuthorizationId = props.applicationAuthorization?.id;
  editForm.name = '';
  editForm.tokenHash = '';
  editForm.maskedToken = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: PersonalStaticAccessToken) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.applicationAuthorizationId = row.applicationAuthorizationId;
  editForm.name = row.name;
  editForm.tokenHash = row.tokenHash;
  editForm.maskedToken = row.maskedToken;
  editDialogVisible.value = true;
};

// 使用 applicationAuthorizationId 的真实十六进制表达，随机段负责补足整体长度。
const toBigintHex = (value?: number) => BigInt(value ?? 0).toString(16).toUpperCase();

// 后端只保存摘要，完整 API key 仅在创建后展示一次。
const hashApiKey = async (apiKey: string) => sha256(apiKey);

// 列表中仅展示前 8 位和后 4 位，中间用星号保持长度一致。
const maskApiKey = (apiKey: string) => `${apiKey.slice(0, 8)}${'*'.repeat(16)}${apiKey.slice(-4)}`;

// 从 CSPRNG 生成随机字节，再编码为无填充 base64url，避免使用 Math.random 或手写随机字符表。
const generateSecureRandomBase64Url = (length: number) => {
  const byteLength = Math.ceil((length * 3) / 4);
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
};

// API key 格式：sk-{applicationAuthorizationIdHex}-{base64urlRandom}，总长度固定为 64。
const generateApiKey = (applicationAuthorizationId?: number) => {
  const prefix = `sk-${toBigintHex(applicationAuthorizationId)}-`;
  const randomLength = 64 - prefix.length;
  return `${prefix}${generateSecureRandomBase64Url(randomLength)}`;
};

const createdApiKey = ref('');
const apiKeyDialogVisible = ref(false);

const closeApiKeyDialog = () => {
  createdApiKey.value = '';
  apiKeyDialogVisible.value = false;
};

const copyApiKey = async () => {
  try {
    await navigator.clipboard.writeText(createdApiKey.value);
    ElMessage.success('复制成功');
  } catch (error) {
    ElMessage.warning('复制失败，请手动复制 API key');
  }
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const apiKey = isEdit.value ? '' : generateApiKey(editForm.applicationAuthorizationId);
  const tokenHash = isEdit.value ? editForm.tokenHash : await hashApiKey(apiKey);
  const maskedToken = isEdit.value ? editForm.maskedToken : maskApiKey(apiKey);

  const payload: PersonalStaticAccessTokenPayload = {
    applicationAuthorizationId: editForm.applicationAuthorizationId,
    name: editForm.name,
    tokenHash,
    maskedToken,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    
    await PersonalStaticAccessTokenApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
    await loadData();
    
    editDialogVisible.value = false;

    if (!isEdit.value) {
      createdApiKey.value = apiKey;
      apiKeyDialogVisible.value = true;
    }
  } catch (error: any) {
    showErrorMessage(error || '保存失败');
  }
};

// 挂载回调
onMounted(() => {
  syncApplicationAuthorizationQuery();
  // 查询列表
  loadData();
});

watch(
  () => props.applicationAuthorization?.id,
  () => {
    syncApplicationAuthorizationQuery();
    pagination.pageNum = 1;
    loadData();
  }
);
</script>

<style scoped>
.personal_static_access_token-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.personal_static_access_token-page--embedded {
  padding: 0;
  background-color: transparent;
}

.personal_static_access_token-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.personal_static_access_token-page--embedded .personal_static_access_token-page__header {
  padding: 0 0 12px;
  background-color: transparent;
}

.personal_static_access_token-page--embedded .personal_static_access_token-page__header h2 {
  font-size: 16px;
}

.personal_static_access_token-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.personal_static_access_token-page__header h2 {
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

.personal_static_access_token-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.personal_static_access_token-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.api-key-dialog__tips {
  margin: 0 0 16px;
  color: var(--el-text-color-regular);
  line-height: 1.7;
}
</style>
