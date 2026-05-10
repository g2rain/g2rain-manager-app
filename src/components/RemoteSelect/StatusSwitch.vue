<template>
  <el-switch
    v-if="isVisible"
    v-model="innerValue"
    :disabled="isDisabled"
    :loading="loading"
    :inline-prompt="inlinePrompt"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :active-text="activeLabel"
    :inactive-text="inactiveLabel"
    @click="handleUserClick"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { PageElementPermission } from '@/components/permission';

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
  permission?: string;
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

const props = withDefaults(defineProps<Props>(), {
  activeValue: 'ACTIVE',
  inactiveValue: 'INACTIVE',
  disabled: false,
  inlinePrompt: true,
  successMessage: '更新成功',
  errorMessage: '更新失败',
});

const emit = defineEmits<Emits>();

/**
 * ======================
 * 核心状态（使用 active/inactive 值）
 * ======================
 */
const innerValue = ref<StatusValue>(props.modelValue);
const loading = ref(false);

/**
 * 用户触发标记（核心）
 */
const isUserTrigger = ref(false);

/**
 * 回滚保护
 */
const isRollingBack = ref(false);

/**
 * ======================
 * 权限控制
 * ======================
 */
const isVisible = computed(() => {
  if (!props.permission) return true;
  return PageElementPermission.isVisible(props.permission);
});

const isEnabledByPermission = computed(() => {
  if (!props.permission) return true;
  return PageElementPermission.isEnabled(props.permission);
});

const isDisabled = computed(() => {
  return props.disabled || loading.value || !isEnabledByPermission.value;
});

/**
 * ======================
 * 文案
 * ======================
 */
const activeLabel = computed(() => {
  const hit = props.options?.find(i => i.value === props.activeValue);
  return hit?.label || (props.activeValue === 'ACTIVE' ? '有效' : String(props.activeValue));
});

const inactiveLabel = computed(() => {
  const hit = props.options?.find(i => i.value === props.inactiveValue);
  return hit?.label || (props.inactiveValue === 'INACTIVE' ? '无效' : String(props.inactiveValue));
});

/**
 * ======================
 * 外部值 → 内部同步（无副作用）
 * ======================
 */
watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val;
  }
);

/**
 * ======================
 * 用户点击标记
 * ======================
 */
const handleUserClick = () => {
  if (isDisabled.value) return;
  isUserTrigger.value = true;
};

/**
 * ======================
 * 状态变更处理（核心逻辑）
 * ======================
 */
const handleChange = async (val: StatusValue) => {
  /**
   * 只允许用户触发
   */
  if (!isUserTrigger.value) return;
  isUserTrigger.value = false;

  /**
   * 防止回滚触发
   */
  if (isRollingBack.value) return;

  const nextValue = val;
  const prevValue = props.modelValue;

  /**
   * 无变化不处理
   */
  if (nextValue === prevValue) return;

  /**
   * 乐观更新
   */
  emit('update:modelValue', nextValue);

  loading.value = true;

  try {
    await props.apiMethod({ nextValue, prevValue });

    if (props.successMessage) {
      ElMessage.success(props.successMessage);
    }

    emit('success', { nextValue, prevValue });

  } catch (error) {
    /**
     * 回滚（不会触发接口）
     */
    isRollingBack.value = true;

    innerValue.value = prevValue;
    emit('update:modelValue', prevValue);

    if (props.errorMessage) {
      ElMessage.error(props.errorMessage);
    }

    emit('error', { nextValue, prevValue, error });

  } finally {
    loading.value = false;
    isRollingBack.value = false;
  }
};
</script>