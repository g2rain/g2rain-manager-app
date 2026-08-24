<template>
  <RemoteSelect
    ref="remoteSelectRef"
    v-model="innerValue"
    :fetch-data="fetchData"
    :prefetch-on-open="prefetchOnOpen"
    :value-key="valueKey"
    :label-key="labelKey"
    :placeholder="resolvedPlaceholder"
    :clearable="resolvedClearable"
    :auto-select-first-when-empty="autoSelectFirstWhenEmpty"
    :disabled="disabled"
    :width="width"
    :debounce-delay="debounceDelay"
    @change="handleChange"
    @clear="$emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAccessTokenStore } from '@platform/stores';
import { t } from '@platform/i18n';
import RemoteSelect from './index.vue';
import type { FetchDataFunction, RemoteSelectOption } from './types';

interface Props {
  modelValue?: number | null;
  apiMethod: (params: { key?: string; value?: number }) => Promise<RemoteSelectOption[]>;
  valueKey?: string;
  labelKey?: string;
  placeholder?: string;
  /** 显式传入时覆盖 token 策略 */
  clearable?: boolean;
  disabled?: boolean;
  width?: string;
  debounceDelay?: number;
  prefetchOnOpen?: boolean;
  /**
   * 非管理公司时是否用 token.organId 自动回填。
   * 角色「新增」等场景传 false，避免预设机构。
   */
  useTokenDefault?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: number | null | undefined): void;
  (e: 'change', value: number | null | undefined): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: 'organId',
  labelKey: 'organName',
  placeholder: undefined,
  disabled: false,
  width: '200px',
  debounceDelay: 300,
  prefetchOnOpen: true,
  useTokenDefault: true,
});

const emit = defineEmits<Emits>();
const tokenStore = useAccessTokenStore();
const remoteSelectRef = ref<InstanceType<typeof RemoteSelect> | null>(null);

const resolvedPlaceholder = computed(() => props.placeholder ?? t('MG_PH_ORGAN', '请选择所属机构'));

const isEmptyModelValue = (value: number | null | undefined) => value === null || value === undefined;

/** 非管理公司且未选中时，用 token.organId 同步回填 v-model（早于父页 onMounted / loadData） */
const applyTokenOrganDefault = () => {
  if (!props.useTokenDefault || tokenStore.isAdminCompany || !isEmptyModelValue(props.modelValue)) {
    return;
  }
  const organId = tokenStore.organId;
  if (organId == null) {
    return;
  }
  emit('update:modelValue', organId);
  emit('change', organId);
};

watch(
  () => [props.modelValue, tokenStore.organId, props.useTokenDefault] as const,
  () => applyTokenOrganDefault(),
  { immediate: true },
);

const autoSelectFirstWhenEmpty = computed(
  () => props.useTokenDefault && !tokenStore.isAdminCompany && tokenStore.organId == null,
);

const resolvedClearable = computed(() => {
  if (props.clearable !== undefined) {
    return props.clearable;
  }
  return tokenStore.isAdminCompany;
});

const innerValue = computed({
  get: () => props.modelValue,
  set: (value: number | null | undefined) => {
    emit('update:modelValue', value);
  },
});

const handleChange = (value: number | string | null | undefined) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  emit('change', numValue);
};

const fetchData: FetchDataFunction<RemoteSelectOption> = async (params) => {
  try {
    return await props.apiMethod(params);
  } catch (error) {
    console.error('OrganSelect fetchData error:', error);
    return [];
  }
};

defineExpose({
  openDropdown: () => remoteSelectRef.value?.openDropdown?.(),
  focus: () => remoteSelectRef.value?.focus?.(),
});
</script>
