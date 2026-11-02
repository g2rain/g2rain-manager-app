<template>
  <!-- 嵌入应用授权页：管理某组"机构 + 应用"下的匿名接入码。
       入口由外层 application_authorization:manage_anonymous_entries 控制，子页按钮不再单独挂权限 -->
  <div class="anonymous-entry">
    <div class="anonymous-entry__header">
      <span class="anonymous-entry__scope">
        {{ applicationAuthorization.organName }} · {{ applicationAuthorization.applicationName }}
      </span>
      <el-button type="primary" size="small" @click="handleCreate">
        {{ $t('MG_ANON_BTN_ADD', '新增接入码') }}
      </el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="entryName" :label="$t('MG_ANON_FIELD_NAME', '接入码名称')" min-width="160" />
      <el-table-column :label="$t('MG_ANON_FIELD_KEY', '接入码')" min-width="280">
        <template #default="{ row }">
          <span class="anonymous-entry__key">{{ row.entryKey }}</span>
          <el-button type="primary" link size="small" @click="copyKey(row.entryKey)">
            {{ $t('G2_BTN_COPY', '复制') }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('G2_FIELD_STATUS', '状态')" width="110">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            usage-code="ENABLE_STATUS"
            :api-method="changeStatus(row)"
            @success="loadData"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="170" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" width="120">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            {{ $t('G2_BTN_EDIT', '编辑') }}
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            {{ $t('G2_BTN_DELETE', '删除') }}
          </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <span>{{ $t('MG_ANON_EMPTY', '暂无接入码，新增后可把接入码配置到对话客户端或分享给访客。') }}</span>
      </template>
    </el-table>

    <!-- 新增 / 编辑：接入码与状态由服务端维护，只填名称 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? $t('MG_ANON_DLG_EDIT', '编辑接入码') : $t('MG_ANON_DLG_ADD', '新增接入码')"
      width="460px"
      append-to-body
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="140px" @submit.prevent>
        <el-form-item :label="$t('MG_ANON_FIELD_NAME', '接入码名称')" prop="entryName">
          <el-input
            v-model="editForm.entryName"
            maxlength="64"
            show-word-limit
            :placeholder="$t('MG_ANON_PH_NAME', '如：官网客服')"
          />
        </el-form-item>
        <el-form-item v-if="!editForm.id">
          <span class="anonymous-entry__hint">{{ $t('MG_ANON_HINT_AUTO_KEY', '保存后自动生成接入码，默认为有效状态。') }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import { AnonymousEntryApi } from './api';
import type { AnonymousEntry, EntryStatus } from './type';
import type { ApplicationAuthorization } from '../type';
import { StatusSwitch } from '@g2rain/ui/platform';

const props = defineProps<{
  applicationAuthorization: ApplicationAuthorization;
}>();

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
  } catch {
    // 请求失败已由 http 层统一提示
  } finally {
    loading.value = false;
  }
};

watch(() => props.applicationAuthorization.id, loadData, { immediate: true });

const copyKey = async (key: string) => {
  try {
    await navigator.clipboard.writeText(key);
    ElMessage.success(t('G2_MSG_COPIED', '已复制'));
  } catch {
    ElMessage.warning(t('MG_ANON_MSG_COPY_FAIL', '复制失败，请手动选择复制'));
  }
};

const handleDelete = (row: AnonymousEntry) => {
  ElMessageBox.confirm(
    t(
      'MG_ANON_DEL_CONFIRM',
      { name: row.entryName },
      '确认删除接入码「{name}」吗？删除后该入口的访客将无法继续使用。',
    ),
    t('G2_LBL_TIP', '提示'),
    {
      type: 'warning',
      appendTo: 'body',
    },
  )
    .then(async () => {
      await AnonymousEntryApi.remove(row.id);
      await loadData();
      ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
    })
    .catch(() => {});
};

const editDialogVisible = ref(false);
const saving = ref(false);
const editFormRef = ref<FormInstance | null>(null);
const editForm = reactive<{ id?: number; entryName: string }>({ id: undefined, entryName: '' });

const editRules = computed<FormRules>(() => ({
  entryName: [{ required: true, message: t('MG_ANON_VLD_NAME', '请输入接入码名称'), trigger: 'blur' }],
}));

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
    ElMessage.success(editForm.id ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    editDialogVisible.value = false;
    await loadData();
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
