<template>
  <RemoteSelect
    v-model="innerValue"
    :fetch-data="fetchData"
    :prefetch-on-open="props.prefetchOnOpen"
    :value-key="valueKey"
    :label-key="labelKey"
    :placeholder="placeholder"
    :clearable="resolvedClearable"
    :auto-select-first-when-empty="resolvedAutoSelectFirst"
    :disabled="disabled"
    :width="width"
    :debounce-delay="debounceDelay"
    @change="handleChange"
    @clear="$emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAccessTokenStore } from '@platform/stores';
import { RemoteSelect } from './index';
import type { FetchDataFunction, RemoteSelectOption } from './types';

interface Props {
  modelValue?: number | null;
  /** API 方法（必填），接受包含 key 和 value 的参数对象 */
  apiMethod: (params: { key?: string; value?: number }) => Promise<RemoteSelectOption[]>;
  /** 值字段名，默认为 'organId' */
  valueKey?: string;
  /** 标签字段名，默认为 'organName' */
  labelKey?: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否可清空 */
  clearable?: boolean;
  /** 无选中值时是否默认选第一项 */
  autoSelectFirst?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 宽度 */
  width?: string;
  /** 远程搜索防抖延迟（毫秒），与 RemoteSelect 一致 */
  debounceDelay?: number;
  /**
   * 是否在打开下拉时预取一次默认数据
   * 默认为 true，便于直接看到一部分机构列表
   */
  prefetchOnOpen?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: number | null | undefined): void;
  (e: 'change', value: number | null | undefined): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: 'organId',
  labelKey: 'organName',
  placeholder: '请选择所属机构',
  disabled: false,
  width: '200px',
  debounceDelay: 300,
  prefetchOnOpen: true,
});

const emit = defineEmits<Emits>();
const tokenStore = useAccessTokenStore();

const resolvedClearable = computed(() => {
  if (props.clearable !== undefined) {
    return props.clearable;
  }
  return tokenStore.isAdminCompany;
});

const resolvedAutoSelectFirst = computed(() => {
  if (props.autoSelectFirst !== undefined) {
    return props.autoSelectFirst;
  }
  return !tokenStore.isAdminCompany;
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

const fetchData: FetchDataFunction<RemoteSelectOption> = async (
  params: { key?: string; value?: number },
): Promise<RemoteSelectOption[]> => {
  try {
    const data = await props.apiMethod(params);
    return data;
  } catch (error) {
    console.error('OrganSelect fetchData error:', error);
    return [];
  }
};
</script>
