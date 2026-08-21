<template>
  <div v-if="items.length === 0" class="role-perm-tags__empty">—</div>
  <div v-else class="role-perm-tags">
    <PermissionTooltip
      v-for="item in visibleItems"
      :key="item.controlUnitId"
      :name="item.controlUnitName || String(item.controlUnitId)"
      :description="item.description"
    >
      <el-tag size="small" effect="light" class="role-perm-tags__tag">
        {{ item.controlUnitName || item.controlUnitId }}
      </el-tag>
    </PermissionTooltip>
    <el-tooltip
      v-if="overflowCount > 0"
      placement="top"
      :show-after="200"
      popper-class="role-perm-tags-more-popper"
    >
      <template #content>
        <div class="role-perm-tags__more">
          <div
            v-for="item in items"
            :key="`all-${item.controlUnitId}`"
            class="role-perm-tags__more-item"
          >
            <div class="role-perm-tags__more-name">{{ item.controlUnitName || item.controlUnitId }}</div>
            <div v-if="item.description" class="role-perm-tags__more-desc">{{ item.description }}</div>
          </div>
        </div>
      </template>
      <el-tag size="small" type="info" effect="plain" class="role-perm-tags__tag">
        +{{ overflowCount }} {{ $t('MG_ROLE_PERM_MORE', '项') }}
      </el-tag>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RoleControlUnitRelation } from '../role_control_unit_relation/type';
import PermissionTooltip from './PermissionTooltip.vue';

interface Props {
  items: RoleControlUnitRelation[];
  maxVisible?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 2,
});

const visibleItems = computed(() => props.items.slice(0, props.maxVisible));
const overflowCount = computed(() => Math.max(0, props.items.length - props.maxVisible));
</script>

<style scoped>
.role-perm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.role-perm-tags__empty {
  color: var(--el-text-color-placeholder);
}

.role-perm-tags__tag {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<!-- tooltip content 会 teleport 到 body，需非 scoped -->
<style>
.role-perm-tags-more-popper .role-perm-tags__more {
  max-width: 320px;
  max-height: 280px;
  overflow: auto;
}

.role-perm-tags-more-popper .role-perm-tags__more-item + .role-perm-tags__more-item {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.role-perm-tags-more-popper .role-perm-tags__more-name {
  font-weight: 600;
  color: var(--el-color-primary-light-3);
}

.role-perm-tags-more-popper .role-perm-tags__more-desc {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.9;
}
</style>
