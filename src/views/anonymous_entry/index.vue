<template>
  <!-- 嵌入应用授权页：管理某组"机构 + 应用"下的匿名接入码 -->
  <div class="anonymous-entry">
    <div class="anonymous-entry__header">
      <span class="anonymous-entry__scope">
        {{ applicationAuthorization.organName }} · {{ applicationAuthorization.applicationName }}
      </span>
      <el-button type="primary" size="small" v-permission="'anonymous_entry:add'" @click="handleCreate">新增接入码</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="entryName" label="接入码名称" min-width="160" />
      <el-table-column label="接入码" min-width="280">
        <template #default="{ row }">
          <span class="anonymous-entry__key">{{ row.entryKey }}</span>
          <el-button type="primary" link size="small" @click="copyKey(row.entryKey)">复制</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            v-permission="'anonymous_entry:status_update'"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            :options="statusOptions"
            :api-method="changeStatus(row)"
            @success="loadData"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" v-permission="'anonymous_entry:edit'" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" v-permission="'anonymous_entry:delete'" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <span>暂无接入码，新增后可把接入码配置到对话客户端或分享给访客。</span>
      </template>
    </el-table>

    <!-- 新增 / 编辑：接入码与状态由服务端维护，只填名称 -->
    <el-dialog v-model="editDialogVisible" :title="editForm.id ? '编辑接入码' : '新增接入码'" width="460px" append-to-body>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="96px" @submit.prevent>
        <el-form-item label="接入码名称" prop="entryName">
          <el-input v-model="editForm.entryName" maxlength="64" show-word-limit placeholder="如：官网客服" />
        </el-form-item>
        <el-form-item v-if="!editForm.id">
          <span class="anonymous-entry__hint">保存后自动生成接入码，默认为有效状态。</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AnonymousEntryApi } from './api';
import type { AnonymousEntry, EntryStatus } from './type';
import type { ApplicationAuthorization } from '../application_authorization/type';
import { StatusSwitch, showErrorMessage } from '@/components';

const props = defineProps<{
  applicationAuthorization: ApplicationAuthorization;
}>();

const statusOptions: Array<{ label: string; value: EntryStatus }> = [
  { label: '有效', value: 'ACTIVE' },
  { label: '无效', value: 'INACTIVE' },
];

// 状态开关回调：放在 script 里，避免模板内直接引用类导致 IDE 类型误报
const changeStatus = (row: AnonymousEntry) =>
  ({ nextValue }: { nextValue: string | number | boolean }) =>
    AnonymousEntryApi.updateStatus(row.id, nextValue as EntryStatus);

const loading = ref(false);
const tableData = ref<AnonymousEntry[]>([]);

const loadData = async () => {
  loading.value = true;
  try {
    tableData.value = await AnonymousEntryApi.list({
      organId: props.applicationAuthorization.organId,
      applicationId: props.applicationAuthorization.applicationId,
    });
  } catch (error: any) {
    showErrorMessage(error || '加载接入码失败');
  } finally {
    loading.value = false;
  }
};

watch(() => props.applicationAuthorization.id, loadData, { immediate: true });

const copyKey = async (key: string) => {
  try {
    await navigator.clipboard.writeText(key);
    ElMessage.success('已复制');
  } catch {
    ElMessage.warning('复制失败，请手动选择复制');
  }
};

const handleDelete = (row: AnonymousEntry) => {
  ElMessageBox.confirm(`确认删除接入码「${row.entryName}」吗？删除后该入口的访客将无法继续使用。`, '提示', {
    type: 'warning',
    appendTo: 'body',
  })
    .then(async () => {
      try {
        await AnonymousEntryApi.remove(row.id);
        await loadData();
        ElMessage.success('删除成功');
      } catch (error: any) {
        showErrorMessage(error || '删除失败');
      }
    })
    .catch(() => {});
};

const editDialogVisible = ref(false);
const saving = ref(false);
const editFormRef = ref<FormInstance | null>(null);
const editForm = reactive<{ id?: number; entryName: string }>({ id: undefined, entryName: '' });

const editRules: FormRules = {
  entryName: [{ required: true, message: '请输入接入码名称', trigger: 'blur' }],
};

const openEditor = (id: number | undefined, entryName: string) => {
  editFormRef.value?.clearValidate();
  editForm.id = id;
  editForm.entryName = entryName;
  editDialogVisible.value = true;
};

const handleCreate = () => openEditor(undefined, '');

const handleEdit = (row: AnonymousEntry) => openEditor(row.id, row.entryName);

const submitEdit = async () => {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  // 新增时机构与应用取自当前授权行；编辑只改名称
  const { organId, applicationId } = props.applicationAuthorization;
  saving.value = true;
  try {
    await AnonymousEntryApi.save(
      editForm.id
        ? { id: editForm.id, entryName: editForm.entryName }
        : { organId, applicationId, entryName: editForm.entryName },
    );
    ElMessage.success(editForm.id ? '更新成功' : '新增成功');
    editDialogVisible.value = false;
    await loadData();
  } catch (error: any) {
    showErrorMessage(error || '保存失败');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.anonymous-entry__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.anonymous-entry__scope {
  color: var(--el-text-color-secondary);
}

.anonymous-entry__key {
  margin-right: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.anonymous-entry__hint {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
