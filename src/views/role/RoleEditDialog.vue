<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    destroy-on-close
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item :label="$t('MG_FIELD_ORGAN', '所属机构')" prop="organId">
        <el-input
          v-if="mode === 'invite'"
          :model-value="organNameDisplay"
          disabled
          style="width: 100%"
        />
        <OrganSelect
          v-else
          ref="organSelectRef"
          v-model="form.organId"
          :disabled="isEdit"
          :use-token-default="false"
          :api-method="OrganApi.searchOrgans"
          :placeholder="$t('MG_PH_ORGAN', '请选择所属机构')"
          width="100%"
          @change="handleOrganChange"
        />
      </el-form-item>

      <el-form-item :label="$t('MG_ROLE_FIELD_NAME', '角色名称')" prop="roleName">
        <el-input
          ref="roleNameInputRef"
          v-model="form.roleName"
          :placeholder="$t('MG_ROLE_PH_NAME', '请输入角色名称')"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item :label="$t('MG_ROLE_FIELD_PERMS', '功能权限')">
        <div v-loading="permsLoading" class="role-edit-dialog__perms">
          <div v-if="!form.organId" class="role-edit-dialog__hint">
            {{ $t('MG_ROLE_PERM_NEED_ORGAN', '请先选择所属机构') }}
          </div>
          <div v-else-if="!permsLoading && assignablePerms.length === 0" class="role-edit-dialog__hint">
            {{ $t('MG_ROLE_PERM_EMPTY', '该机构暂无可分配功能权限') }}
          </div>
          <el-checkbox-group v-else v-model="selectedControlUnitIds" class="role-edit-dialog__checks">
            <PermissionTooltip
              v-for="item in assignablePerms"
              :key="item.controlUnitId"
              :name="item.controlUnitName || String(item.controlUnitId)"
              :description="item.description"
            >
              <el-checkbox :value="item.controlUnitId">
                {{ item.controlUnitName || item.controlUnitId }}
              </el-checkbox>
            </PermissionTooltip>
          </el-checkbox-group>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" :loading="saving" @click="submit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules, InputInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { OrganSelect } from '@/components';
import { OrganApi } from '../organ/api';
import { RoleApi } from './api';
import { RoleControlUnitRelationApi } from '../role_control_unit_relation/api';
import type { RoleControlUnitRelation } from '../role_control_unit_relation/type';
import type { Role } from './type';
import PermissionTooltip from './PermissionTooltip.vue';

export type RoleEditMode = 'invite' | 'manage';

interface Props {
  modelValue: boolean;
  mode: RoleEditMode;
  roleId?: number | null;
  roleName?: string | null;
  organId?: number | null;
  organName?: string | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success', role: Role): void;
}

const props = withDefaults(defineProps<Props>(), {
  roleId: null,
  roleName: null,
  organId: null,
  organName: null,
});

const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const isEdit = computed(() => props.roleId != null && props.roleId > 0);

const dialogTitle = computed(() =>
  isEdit.value ? t('MG_ROLE_DLG_EDIT', '编辑角色') : t('MG_ROLE_DLG_ADD', '新增角色'),
);

const formRef = ref<FormInstance | null>(null);
const organSelectRef = ref<{ openDropdown?: () => void; focus?: () => void } | null>(null);
const roleNameInputRef = ref<InputInstance | null>(null);
const saving = ref(false);
const permsLoading = ref(false);
const assignablePerms = ref<RoleControlUnitRelation[]>([]);
const selectedControlUnitIds = ref<number[]>([]);
const originalControlUnitIds = ref<Set<number>>(new Set());

const form = reactive({
  id: undefined as number | undefined,
  organId: undefined as number | undefined,
  roleName: '',
});

const organNameDisplay = computed(() => props.organName || String(form.organId ?? ''));

const formRules = computed<FormRules>(() => ({
  organId: [{ required: true, message: t('MG_ROLE_VLD_ORGAN', '请选择所属机构'), trigger: 'change' }],
  roleName: [
    { required: true, message: t('MG_ROLE_VLD_NAME', '请输入角色名称'), trigger: 'blur' },
    {
      max: 20,
      message: t('MG_ROLE_VLD_NAME_LEN', '角色名称不能超过 20 个字'),
      trigger: 'blur',
    },
  ],
}));

const resetForm = () => {
  form.id = undefined;
  form.organId = undefined;
  form.roleName = '';
  assignablePerms.value = [];
  selectedControlUnitIds.value = [];
  originalControlUnitIds.value = new Set();
};

const loadAssignable = async (organId: number) => {
  permsLoading.value = true;
  try {
    assignablePerms.value = await RoleControlUnitRelationApi.listAssignable(organId);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('MG_ROLE_MSG_PERM_LOAD_FAIL', '加载功能权限失败');
    ElMessage.error(msg);
    assignablePerms.value = [];
  } finally {
    permsLoading.value = false;
  }
};

const loadSelected = async (roleId: number) => {
  const list = await RoleControlUnitRelationApi.list({ roleId });
  const ids = list.map((item) => item.controlUnitId);
  selectedControlUnitIds.value = [...ids];
  originalControlUnitIds.value = new Set(ids);
};

const buildRoleResult = (roleId: number): Role =>
  ({
    id: roleId,
    organId: form.organId!,
    organName: props.organName || '',
    roleType: 'USER',
    roleName: form.roleName.trim(),
  }) as Role;

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;
    resetForm();
    await nextTick();
    formRef.value?.clearValidate();

    if (isEdit.value && props.roleId) {
      form.id = props.roleId;
      form.organId = props.organId ?? undefined;
      form.roleName = props.roleName ?? '';
      if (form.organId) {
        await Promise.all([loadAssignable(form.organId), loadSelected(props.roleId)]);
      }
      return;
    }

    if (props.mode === 'invite' && props.organId) {
      form.organId = props.organId;
      await loadAssignable(props.organId);
    }
  },
);

const handleOrganChange = async (organId: number | null | undefined) => {
  selectedControlUnitIds.value = [];
  originalControlUnitIds.value = new Set();
  assignablePerms.value = [];
  if (organId) {
    await loadAssignable(organId);
    await nextTick();
    roleNameInputRef.value?.focus?.();
  }
};

const handleOpened = async () => {
  if (props.mode === 'manage' && !isEdit.value) {
    await nextTick();
    organSelectRef.value?.openDropdown?.();
  } else if (form.organId) {
    await nextTick();
    roleNameInputRef.value?.focus?.();
  }
};

const handleClosed = () => {
  resetForm();
};

const submit = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  saving.value = true;
  try {
    const savedId = await RoleApi.save({
      id: isEdit.value ? form.id : undefined,
      organId: form.organId,
      roleName: form.roleName.trim(),
    });
    const roleId = Number(savedId || form.id);

    if (!roleId) {
      ElMessage.error(t('G2_MSG_SAVE_FAIL', '保存失败'));
      return;
    }

    const selected = new Set(selectedControlUnitIds.value);
    const controlUnitIds = isEdit.value
      ? [...selected].filter((id) => !originalControlUnitIds.value.has(id))
      : selectedControlUnitIds.value;
    const deleteControlUnitIds = isEdit.value
      ? [...originalControlUnitIds.value].filter((id) => !selected.has(id))
      : [];

    if (controlUnitIds.length > 0 || deleteControlUnitIds.length > 0) {
      try {
        await RoleControlUnitRelationApi.save({
          roleId,
          controlUnitIds,
          deleteControlUnitIds,
        });
      } catch (error: unknown) {
        const msg =
          error instanceof Error
            ? error.message
            : t('MG_ROLE_MSG_PERM_SAVE_FAIL', '角色已保存，但功能权限配置失败');
        ElMessage.error(msg);
        emit('success', buildRoleResult(roleId));
        visible.value = false;
        return;
      }
    }

    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    emit('success', buildRoleResult(roleId));
    visible.value = false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
    ElMessage.error(msg);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.role-edit-dialog__perms {
  width: 100%;
  min-height: 80px;
  max-height: 280px;
  overflow: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 8px 12px;
  box-sizing: border-box;
}

.role-edit-dialog__hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.role-edit-dialog__checks {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
