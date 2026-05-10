<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :loading="loading"
    filterable
    remote
    :remote-method="handleRemoteSearch"
    reserve-keyword
    :default-first-option="false"
    :style="`width: ${width}`"
    @visible-change="handleVisibleChange"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in options"
      :key="getValue(item)"
      :label="getLabel(item)"
      :value="getValue(item)"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { FetchDataFunction, RemoteSelectOption } from './types';

// 导出类型供外部使用
export type { FetchDataFunction, RemoteSelectOption } from './types';

interface Props {
  /** v-model 绑定值 */
  modelValue?: number | string | null;
  /** 数据获取函数 */
  fetchData: FetchDataFunction<RemoteSelectOption>;
  /** 值字段名，默认为 'value' */
  valueKey?: string;
  /** 标签字段名，默认为 'label' */
  labelKey?: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否可清空 */
  clearable?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 宽度 */
  width?: string;
  /** 防抖延迟（毫秒），默认 300 */
  debounceDelay?: number;
  /**
   * 是否在打开下拉时预取一次空关键字数据
   * - 用于字典等场景：用户未输入时也需要默认选项列表
   */
  prefetchOnOpen?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: number | string | null | undefined): void;
  (e: 'change', value: number | string | null | undefined): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: 'value',
  labelKey: 'label',
  placeholder: '请选择',
  clearable: true,
  disabled: false,
  width: '200px',
  debounceDelay: 300,
  prefetchOnOpen: false,
});

const emit = defineEmits<Emits>();

const selectedValue = ref<number | string | null | undefined>(props.modelValue);
const options = ref<RemoteSelectOption[]>([]);
const loading = ref(false);
/** 当前下拉会话内是否输入过搜索词（用于区分「用户清空搜索」与「选中后组件触发的空串 remote」） */
const userTypedSearch = ref(false);
/** 最近一次 remote 请求对应的规范化关键字（与下方 params 一致）；打开下拉时重置，用于去重重复 remote */
const lastRemoteQuery = ref<string | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const prefetching = ref(false);

const mergeOptions = (base: RemoteSelectOption[], incoming: RemoteSelectOption[]): RemoteSelectOption[] => {
  const map = new Map<string | number, RemoteSelectOption>();
  for (const item of base) {
    map.set(getValue(item), item);
  }
  for (const item of incoming) {
    map.set(getValue(item), item);
  }
  return Array.from(map.values());
};

/**
 * 防抖函数
 */
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  return (...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * 获取选项的值
 */
const getValue = (item: RemoteSelectOption): number | string => {
  return item[props.valueKey];
};

/**
 * 获取选项的标签
 */
const getLabel = (item: RemoteSelectOption): string => {
  return item[props.labelKey] || String(item[props.valueKey] || '');
};

/**
 * 判断字符串是否为纯数字
 */
const isNumeric = (str: string): boolean => {
  return /^\d+$/.test(str.trim());
};

/**
 * 远程搜索处理（带防抖）
 */
const handleRemoteSearch = debounce(async (query: string) => {
  const trimmed = (query ?? '').trim();
  if (trimmed) {
    userTypedSearch.value = true;
  }

  if (!trimmed) {
    if (!props.prefetchOnOpen) {
      options.value = [];
      lastRemoteQuery.value = null;
      return;
    }
    // 未输入过搜索词时的空串多为选中后 Element Plus 重置 remote 触发，忽略以免重复请求与 loading 抖动
    // 首屏默认列表由 visible-change 预取；用户输入后再清空则恢复默认列表
    if (!userTypedSearch.value) {
      return;
    }
  }

  // 与上次成功请求的规范化关键字相同则跳过（去重组件重复触发的 remote）
  if (lastRemoteQuery.value !== null && trimmed === lastRemoteQuery.value) {
    return;
  }

  loading.value = true;
  try {
    // 判断输入是否为数字，构建查询参数
    const params =
      trimmed === ''
        ? {}
        : isNumeric(trimmed)
          ? { value: Number(trimmed) } // 数字时使用 value
          : { key: trimmed }; // 字符串时使用 key

    const data = await props.fetchData(params);
    options.value = data || [];
    lastRemoteQuery.value = trimmed;
  } catch (error) {
    console.error('RemoteSelect fetchData error:', error);
    options.value = [];
  } finally {
    loading.value = false;
  }
}, props.debounceDelay);

const handleVisibleChange = async (visible: boolean) => {
  if (visible) {
    userTypedSearch.value = false;
    lastRemoteQuery.value = null;
  }
  if (!visible || !props.prefetchOnOpen) return;
  // 打开下拉时预取一次空关键字数据（避免用户必须先输入才出现选项）
  if (options.value.length > 0 || prefetching.value) return;

  loading.value = true;
  prefetching.value = true;
  try {
    const data = await props.fetchData({});
    options.value = data || [];
    lastRemoteQuery.value = '';
  } catch (error) {
    console.error('RemoteSelect prefetchOnOpen error:', error);
    options.value = [];
  } finally {
    loading.value = false;
    prefetching.value = false;
  }
};

const prefetchDefaultOptions = async () => {
  if (!props.prefetchOnOpen || options.value.length > 0 || prefetching.value) return;
  loading.value = true;
  prefetching.value = true;
  try {
    const data = await props.fetchData({});
    options.value = data || [];
    lastRemoteQuery.value = '';
  } catch (error) {
    console.error('RemoteSelect prefetchDefaultOptions error:', error);
    options.value = [];
  } finally {
    loading.value = false;
    prefetching.value = false;
  }
};

/**
 * 加载初始值对应的选项
 */
const loadInitialOption = async () => {
  if (selectedValue.value === null || selectedValue.value === undefined) {
    return;
  }

  loading.value = true;
  try {
    // 初始值通常是数字 ID，使用 value 参数
    const params = typeof selectedValue.value === 'number'
      ? { value: selectedValue.value }
      : { key: String(selectedValue.value) };
    
    const data = await props.fetchData(params);
    options.value = mergeOptions(options.value, data || []);
  } catch (error) {
    console.error('RemoteSelect loadInitialOption error:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * 处理值变化
 */
const handleChange = (value: number | string | null | undefined) => {
  emit('update:modelValue', value);
  emit('change', value);
};

/**
 * 处理清空
 */
const handleClear = () => {
  options.value = [];
  lastRemoteQuery.value = null;
  emit('clear');
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    selectedValue.value = newValue;
    if (newValue !== null && newValue !== undefined) {
      const found = options.value.find(item => getValue(item) === newValue);
      if (!found) {
        loadInitialOption();
      }
    }
  },
  { immediate: true }
);

// 组件挂载时，如果有初始值，加载对应的选项
onMounted(() => {
  prefetchDefaultOptions();
  if (selectedValue.value !== null && selectedValue.value !== undefined) {
    loadInitialOption();
  }
});
</script>
