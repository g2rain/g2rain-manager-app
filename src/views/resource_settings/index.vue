<template>
  <div class="resource-settings-page">
    <!-- 标题 -->
    <div class="resource-settings-page__header">
      <h2>资源设置</h2>
    </div>

    <!-- 表单内容 -->
    <div class="resource-settings-page__content" style="background: #fff; padding: 24px; border-radius: 4px;">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px" style="max-width: 500px">
        <!-- 所属应用 -->
        <el-form-item label="所属应用" prop="applicationId">
          <el-select v-model="editForm.applicationId" placeholder="请选择所属应用" style="width: 100%">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- 资源文件 -->
        <el-form-item label="资源文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".json"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-exceed="handleFileExceed"
          >
            <el-button type="primary">选择 JSON 文件</el-button>
            <template #tip>
              <div class="el-upload__tip">只能上传 .json 文件，且不超过 1 个</div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" v-permission="'resource_settings:upload'" @click="submitEdit">保存并上传</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules, type UploadFile, type UploadInstance } from 'element-plus';
import { ResourceSettingsApi } from './api';
import { ApplicationApi } from '../application/api';

const applicationOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取应用列表
const loadDicts = async () => {
  try {
    const res = await ApplicationApi.id2name();
    applicationOptions.value = res.map(u => ({
      value: u.id,
      label: u.applicationName || `${u.id}`
    }));
  } catch (e) {
    ElMessage.error('加载应用列表失败');
  }
};

const editFormRef = ref<FormInstance | null>(null);
const uploadRef = ref<UploadInstance | null>(null);

// 1. 表单状态管理
const editForm = reactive({
  applicationId: undefined as number | undefined,
  file: null as File | null,
});

// 2. 校验规则
const editRules: FormRules = {
  applicationId: [{ required: true, message: '请选择所属应用', trigger: 'change' }],
  file: [{ required: true, message: '请选择资源文件', trigger: 'change' }]
};

// 3. 文件处理逻辑
const handleFileChange = (uploadFile: UploadFile) => {
  // 核心：保存原生 File 对象
  editForm.file = uploadFile.raw || null;
  // 手动触发文件校验
  editFormRef.value?.validateField('file');
};

const handleFileRemove = () => {
  editForm.file = null;
  editFormRef.value?.validateField('file');
};

const handleFileExceed = (files: File[]) => {
  // 如果超过限制，替换旧文件
  uploadRef.value?.clearFiles();
  const file = files[0] as any;
  uploadRef.value?.handleStart(file);
};

// 4. 提交数据
const submitEdit = async () => {
  if (!editFormRef.value) return;

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (!editForm.applicationId) {
          ElMessage.error('请选择所属应用');
          return;
        }
        
        // 使用 FormData 封装参数
        const formData = new FormData();
        if (editForm.file) {
          formData.append('file', editForm.file);
        }

        // 调用 API（确保接口支持 FormData）
        await ResourceSettingsApi.uploadResource(editForm.applicationId, formData);
        ElMessage.success('上传成功');
      } catch (error: any) {
        ElMessage.error(error.message || '上传失败');
      }
    }
  });
};

const resetForm = () => {
  editFormRef.value?.resetFields();
  uploadRef.value?.clearFiles();
  editForm.file = null;
};

// 挂载回调
onMounted(async () => {
  // 先准备字典
  await loadDicts();
});
</script>

<style scoped>
.resource-settings-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.resource-settings-page__header {
  margin-bottom: 20px;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.resource-settings-page__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
</style>
