<template>
  <el-tooltip
    :disabled="disabled"
    placement="top"
    :show-after="200"
    popper-class="permission-tooltip-popper"
  >
    <template #content>
      <div class="permission-tooltip">
        <div class="permission-tooltip__name">{{ name }}</div>
        <div v-if="description" class="permission-tooltip__desc">{{ description }}</div>
      </div>
    </template>
    <span class="permission-tooltip__trigger">
      <slot />
    </span>
  </el-tooltip>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  description?: string | null;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  description: '',
  disabled: false,
});
</script>

<style scoped>
.permission-tooltip__trigger {
  display: inline-flex;
  max-width: 100%;
}
</style>

<!-- tooltip content 会 teleport 到 body，需非 scoped -->
<style>
.permission-tooltip-popper .permission-tooltip__name {
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.permission-tooltip-popper .permission-tooltip__desc {
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.4;
  max-width: 280px;
  white-space: normal;
}
</style>
