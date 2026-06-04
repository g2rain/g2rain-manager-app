<template>
  <el-switch
    v-model="innerValue"
    :disabled="disabled || loading ? true : undefined"
    :loading="loading"
    :inline-prompt="inlinePrompt"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :active-text="activeLabel"
    :inactive-text="inactiveLabel"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
/**
 * 状态列开关封装。
 *
 * 权限：在业务页使用 v-permission="'page:status_update'" 绑定在本组件上，
 * 指令会透传到根节点 el-switch（与按钮同一套权限体系；ENABLED 可操作，VISIBLE/无权限置灰）。
 * build:config 扫描 v-permission 静态字符串即可收集。
 */
import { computed, nextTick, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@platform/i18n';

type StatusValue = string | number | boolean;

interface StatusOption {
  label: string;
  value: StatusValue;
}

interface Props {
  modelValue: StatusValue;
  activeValue?: StatusValue;
  inactiveValue?: StatusValue;
  options?: StatusOption[];
  disabled?: boolean;
  inlinePrompt?: boolean;
  successMessage?: string;
  errorMessage?: string;
  apiMethod: (params: {
    nextValue: StatusValue;
    prevValue: StatusValue;
  }) => Promise<void>;
}

interface Emits {
  (e: 'update:modelValue', value: StatusValue): void;
  (e: 'success', payload: { nextValue: StatusValue; prevValue: StatusValue }): void;
  (e: 'error', payload: { nextValue: StatusValue; prevValue: StatusValue; error: unknown }): void;
}

defineOptions({ inheritAttrs: true });

const props = withDefaults(defineProps<Props>(), {
  activeValue: 'ACTIVE',
  inactiveValue: 'INACTIVE',
  disabled: false,
  inlinePrompt: true,
});

const emit = defineEmits<Emits>();

const innerValue = ref<StatusValue>(props.modelValue);
const loading = ref(false);
/** 外部同步 innerValue 时忽略 change，避免误调接口 */
const ignoreChange = ref(false);
/** 回滚保护 */
const isRollingBack = ref(false);

const activeLabel = computed(() => {
  const hit = props.options?.find(i => i.value === props.activeValue);
  return hit?.label || (props.activeValue === 'ACTIVE' ? t('G2_OPT_ACTIVE', '有效') : String(props.activeValue));
});

const inactiveLabel = computed(() => {
  const hit = props.options?.find(i => i.value === props.inactiveValue);
  return hit?.label || (props.inactiveValue === 'INACTIVE' ? t('G2_OPT_INACTIVE', '无效') : String(props.inactiveValue));
});

watch(
  () => props.modelValue,
  async (val) => {
    ignoreChange.value = true;
    innerValue.value = val;
    await nextTick();
    ignoreChange.value = false;
  }
);

const handleChange = async (val: StatusValue) => {
  if (ignoreChange.value || isRollingBack.value) return;

  const nextValue = val;
  const prevValue = props.modelValue;

  if (nextValue === prevValue) return;

  emit('update:modelValue', nextValue);

  loading.value = true;

  try {
    await props.apiMethod({ nextValue, prevValue });

    const successMsg = props.successMessage ?? t('G2_MSG_UPDATE_OK', '更新成功');
    if (successMsg) {
      ElMessage.success(successMsg);
    }

    emit('success', { nextValue, prevValue });
  } catch (error) {
    isRollingBack.value = true;

    innerValue.value = prevValue;
    emit('update:modelValue', prevValue);

    const errorMsg = props.errorMessage ?? t('G2_MSG_UPDATE_FAIL', '更新失败');
    if (errorMsg) {
      ElMessage.error(errorMsg);
    }

    emit('error', { nextValue, prevValue, error });
  } finally {
    loading.value = false;
    isRollingBack.value = false;
  }
};
</script>
