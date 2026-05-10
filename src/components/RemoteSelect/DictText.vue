<template>
  <span>{{ displayText }}</span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { RemoteSelectOption } from './types';

interface Props {
  /** 当前字典编码 */
  value?: string | null;
  /** 用途编码，用于限定字典范围 */
  usageCode?: string;
  /** API 方法（通常传 DictItemApi.select） */
  apiMethod: (params: { key?: string; usageCode?: string }) => Promise<RemoteSelectOption[]>;
  /** 值字段名，默认为 code */
  valueKey?: string;
  /** 标签字段名，默认为 name */
  labelKey?: string;
  /** 空值占位文本 */
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: 'code',
  labelKey: 'name',
  placeholder: '-',
});

const label = ref('');

const displayText = computed(() => {
  if (label.value) {
    return label.value;
  }
  return props.value || props.placeholder;
});

const loadLabel = async () => {
  const value = props.value?.trim();
  if (!value) {
    label.value = '';
    return;
  }

  try {
    const usageCode = props.usageCode?.trim();
    const options = await props.apiMethod({
      key: value,
      ...(usageCode ? { usageCode } : {}),
    });
    const matched = options.find((item) => String(item[props.valueKey]) === value);
    label.value = matched ? String(matched[props.labelKey] || value) : value;
  } catch (error) {
    console.error('DictText loadLabel error:', error);
    label.value = value;
  }
};

watch(
  () => [props.value, props.usageCode],
  () => {
    void loadLabel();
  },
  { immediate: true },
);
</script>
