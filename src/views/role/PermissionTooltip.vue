<template>
  <el-tooltip
    :disabled="disabled"
    effect="light"
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

<!-- tooltip content 会 teleport 到 body，需非 scoped；跟随页面主题，不用 EP 默认反色气泡 -->
<style>
.permission-tooltip-popper.el-popper {
  background: var(--g2-bg-overlay) !important;
  color: var(--g2-text-primary);
  border: 1px solid var(--g2-border-color);
  box-shadow: var(--el-box-shadow-light);
}

.permission-tooltip-popper.el-popper .el-popper__arrow::before {
  background: var(--g2-bg-overlay) !important;
  border: 1px solid var(--g2-border-color);
}

.permission-tooltip-popper .permission-tooltip__name {
  font-weight: 600;
  color: var(--g2-color-primary);
  margin-bottom: 4px;
}

.permission-tooltip-popper .permission-tooltip__desc {
  color: var(--g2-text-secondary);
  font-size: 12px;
  line-height: 1.4;
  max-width: 280px;
  white-space: normal;
}
</style>
