<template>
  <el-config-provider :locale="elementPlusLocale">
    <div id="app">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { ElConfigProvider } from 'element-plus';
import { storeToRefs } from 'pinia';
import { sso } from '@runtime/auth';
import { isAloneMode } from '@shared/utils/mode.util';
import { useLocaleStore } from '@platform/stores/locale.store';
import { resolveElementPlusLocale } from '@platform/locale';

const { locale: userLocale } = storeToRefs(useLocaleStore());
const elementPlusLocale = computed(() => resolveElementPlusLocale(userLocale.value));

onMounted(() => {
  // qiankun 集成运行时由主应用统一管理 token
  if (isAloneMode()) {
    sso.listenTokenChanges();
  }
});
</script>

<style scoped>
#app {
  min-height: 100%; /* 允许内容超出，由父容器处理滚动 */
  padding: 0;
}
</style>

