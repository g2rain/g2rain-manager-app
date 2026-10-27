<template>
  <el-switch
    :key="`${localeStore.locale}-${innerValue}`"
    v-model="innerValue"
    :disabled="disabled || loading || !permitted ? true : undefined"
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
 * 权限：在业务页传 permission="page:status_update"，组件按页面元素权限计算 disabled
 * （ENABLED 可操作，VISIBLE/无权限不可操作）。build:config 扫描 permission 静态字符串收集。
 */
import { computed, nextTick, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useLocaleStore } from '@platform/stores/locale.store';
import { t } from '@platform/i18n';
import { DictItemApi } from '@/views/dict/api';
import { PageElementPermission } from '../permission';

type StatusValue = string | number | boolean;

interface StatusOption {
  label: string;
  value: StatusValue;
}

interface Props {
  modelValue: StatusValue;
  activeValue?: StatusValue;
  inactiveValue?: StatusValue;
  /** 字典 usageCode；传入时组件内按 locale 拉取文案（切换语言自动更新） */
  usageCode?: string;
  options?: StatusOption[];
  disabled?: boolean;
  /** 页面元素权限码；有值时按页面元素权限判断能否操作 */
  permission?: string;
  inlinePrompt?: boolean;
  successMessage?: string;
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
const localeStore = useLocaleStore();

/** 未传 permission 不受控 */
const permitted = computed(() => !props.permission || PageElementPermission.isEnabled(props.permission));

const innerValue = ref<StatusValue>(props.modelValue);
const loading = ref(false);
/** 外部同步 innerValue 时忽略 change，避免误调接口 */
const ignoreChange = ref(false);
/** 回滚保护 */
const isRollingBack = ref(false);
const dictOptions = ref<StatusOption[]>([]);

async function loadDictOptions() {
  const code = props.usageCode?.trim();
  if (!code) {
    dictOptions.value = [];
    return;
  }
  try {
    const items = await DictItemApi.loadByUsageCode(code);
    dictOptions.value = [...items]
      .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
      .map((item) => ({
        label: item.name || String(item.code),
        value: String(item.code),
      }));
  } catch {
    dictOptions.value = [];
  }
}

watch(
  () => [props.usageCode, localeStore.locale] as const,
  () => {
    void loadDictOptions();
  },
  { immediate: true },
);

const effectiveOptions = computed(() =>
  props.usageCode?.trim() ? dictOptions.value : props.options,
);

const activeLabel = computed(() => {
  localeStore.locale;
  const hit = effectiveOptions.value?.find((i) => i.value === props.activeValue);
  if (hit?.label) {
    return hit.label;
  }
  if (props.activeValue === 'ACTIVE') {
    return t('G2_OPT_ACTIVE', '有效');
  }
  return String(props.activeValue);
});

const inactiveLabel = computed(() => {
  localeStore.locale;
  const hit = effectiveOptions.value?.find((i) => i.value === props.inactiveValue);
  if (hit?.label) {
    return hit.label;
  }
  if (props.inactiveValue === 'INACTIVE') {
    return t('G2_OPT_INACTIVE', '无效');
  }
  return String(props.inactiveValue);
});

watch(
  () => props.modelValue,
  async (val) => {
    ignoreChange.value = true;
    innerValue.value = val;
    await nextTick();
    ignoreChange.value = false;
  },
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

    emit('error', { nextValue, prevValue, error });
  } finally {
    loading.value = false;
    isRollingBack.value = false;
  }
};
</script>
