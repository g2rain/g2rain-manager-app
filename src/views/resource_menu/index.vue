<template>
  <div class="resource-menu-page">
    <!-- 查询表单 -->
    <el-card class="resource-menu-page__search" shadow="never">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <!-- 业务特定查询字段 -->
        <el-form-item label="所属应用">
          <el-select v-model="queryForm.applicationId" placeholder="请选择所属应用" clearable style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="菜单名称">
          <el-input v-model="queryForm.menuName" placeholder="请输入菜单名称" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="菜单编码">
          <el-input v-model="queryForm.menuCode" placeholder="请输入菜单编码" clearable style="width: 200px" />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="resource-menu-page__header">
      <div class="resource-menu-page__title-group">
        <h2>管理菜单数据</h2>
      </div>
      <el-button type="primary" v-permission="'resource_menu:add'" @click="handleCreate(undefined)">新增顶级菜单</el-button>
    </div>

    <!-- 树形 Table -->
    <el-table :data="treeData" row-key="id" :tree-props="{ children: 'children', hasChildren: 'children' }" border
      style="width: 100%">
      <el-table-column prop="menuName" label="菜单名称" width="150" />
      <el-table-column prop="id" label="菜单序号" width="100" />
      <!-- 树形列：菜单名称 -->
      <el-table-column prop="applicationId" label="所属应用" width="120">
        <template #default="{ row }">
          {{applicationOptions.find(item => item.value === row?.applicationId)?.label || ''}}
        </template>
      </el-table-column>
      <el-table-column prop="menuCode" label="菜单编码" width="200" />
      <el-table-column prop="linkPath" label="链接路径" width="230" />
      <el-table-column prop="menuSortOrder" label="排序" width="70" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <!-- 操作列 -->
      <el-table-column label="操作" fixed="right" width="220">
        <template #default="{ row }">
          <el-button link type="primary" v-permission="'resource_menu:edit'" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="success" v-permission="'resource_menu:add'" @click="handleCreate(row)">新增子菜单</el-button>
          <el-button link type="danger" v-permission="'resource_menu:delete'" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑菜单' : '新增菜单'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <!-- 所属应用 -->
        <el-form-item label="所属应用" prop="applicationId" v-if="showApplicationSelect">
          <el-select v-model="editForm.applicationId" placeholder="请选择所属应用" style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- 菜单名称 -->
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="editForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>

        <!-- 菜单编码 -->
        <el-form-item label="菜单编码" prop="menuCode">
          <el-input v-model="editForm.menuCode" placeholder="请输入菜单编码" />
        </el-form-item>

        <!-- 链接路径 -->
        <el-form-item label="链接路径" prop="linkPath">
          <el-input v-model="editForm.linkPath" placeholder="请输入链接路径" />
        </el-form-item>

        <!-- 排序 & 图标 两列布局 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 菜单图标 -->
            <el-form-item label="菜单图标" prop="icon">
              <el-input v-model="editForm.icon" placeholder="请输入菜单图标" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <!-- 排序 -->
            <el-form-item label="菜单排序" prop="menuSortOrder">
              <el-input-number v-model="editForm.menuSortOrder" :min="0" :step="1" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit">保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ResourceMenuApi } from './api';
import { ApplicationApi } from '../application/api';
import type { ResourceMenu, ResourceMenuPayload, ResourceMenuQuery } from './type';

// 业务查询状态
const queryForm = reactive({
  applicationId: undefined as number | undefined,
  menuName: '',
  menuCode: '',
});

// 定义字典引用
const applicationOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取字典信息
const loadDicts = async () => {
  applicationOptions.value = (await ApplicationApi.id2name({
    includeApplicationTypes: ['SUPPORT', 'SYSTEM']
  })).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));
};

// 定义列表引用
const tableData = ref<ResourceMenu[]>([]);
// 根据 tableData 构建树形结构
const treeData = computed(() => {
  const map = new Map<number, ResourceMenu>();
  const tree: ResourceMenu[] = [];

  tableData.value.forEach(item => map.set(item.id!, { ...item, children: [] }));
  tableData.value.forEach(item => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(map.get(item.id!)!);
    } else {
      tree.push(map.get(item.id!)!);
    }
  });

  const sortTree = (nodes: ResourceMenu[]) => {
    nodes.sort((a, b) => (a.menuSortOrder || 0) - (b.menuSortOrder || 0));
    nodes.forEach(n => n.children && sortTree(n.children));
  };

  sortTree(tree);
  return tree;
});

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ResourceMenuQuery;
    const listData = await ResourceMenuApi.list(query);
    // 设置响应结果
    tableData.value = listData;
  } catch (error: any) {
    ElMessage.error(error.message || '加载列表失败');
  }
};

// 查询
const handleSearch = () => {
  loadData();
};

// 重置查询条件
const handleReset = () => {
  queryForm.applicationId = undefined;
  queryForm.menuName = '';
  queryForm.menuCode = '';
  loadData();
};

// 删除数据记录
const handleDelete = (row: ResourceMenu) => {
  ElMessageBox.confirm(`确认删除菜单「${row.id}」吗？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ResourceMenuApi.remove(row.id);
        await loadData();
        ElMessage.success('删除成功');
      } catch (error: any) {
        ElMessage.error(error.message || '删除失败');
      }
    })
    .catch(() => { });
};

// 保存弹窗引用
const editDialogVisible = ref(false);

// 修改标记状态
const isEdit = ref(false);

// 修改组件引用
const editFormRef = ref<FormInstance | null>(null);

// 保存表单状态
const editForm = reactive({
  id: undefined as number | undefined,
  parentId: undefined as number | undefined,
  applicationId: undefined as number | undefined,
  menuName: '',
  menuCode: '',
  linkPath: '',
  icon: '',
  menuSortOrder: 0,
});

// 表单校验规则
const editRules: FormRules = {
  applicationId: [{ required: true, message: '请选择所属应用', trigger: 'blur' }],
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuCode: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }],
  linkPath: [{ required: false, message: '请输入链接路径', trigger: 'blur' }],
  icon: [{ required: false, message: '请输入icon', trigger: 'blur' }],
  menuSortOrder: [{ required: true, message: '请输入排序', trigger: 'blur' }],
};

// 展示选择所属应用状态
const showApplicationSelect = ref(false)

// 打开创建弹窗
const handleCreate = (row?: ResourceMenu) => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();
  // 确定是否需要选择所属应用, 因为是添加顶级菜单
  showApplicationSelect.value = !row

  editForm.id = undefined;
  editForm.parentId = row?.id;
  editForm.applicationId = row?.applicationId;
  editForm.menuName = '';
  editForm.menuCode = '';
  editForm.linkPath = '';
  editForm.icon = '';
  editForm.menuSortOrder = 0;
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ResourceMenu) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();
  showApplicationSelect.value = false;

  editForm.id = row.id;
  editForm.parentId = row.parentId;
  editForm.applicationId = row.applicationId;
  editForm.menuName = row.menuName;
  editForm.menuCode = row.menuCode;
  editForm.linkPath = row.linkPath;
  editForm.icon = row.icon;
  editForm.menuSortOrder = row.menuSortOrder;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ResourceMenuPayload = {
    parentId: editForm.parentId,
    applicationId: editForm.applicationId,
    menuName: editForm.menuName,
    menuCode: editForm.menuCode,
    linkPath: editForm.linkPath,
    icon: editForm.icon,
    menuSortOrder: editForm.menuSortOrder,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ResourceMenuApi.save(payload);
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    await loadData();
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

// 挂载回调
onMounted(async () => {
  // 先准备字典
  await loadDicts();
  // 再查询列表
  await loadData();
});
</script>

<style scoped>
.resource-menu-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.resource-menu-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.resource-menu-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-menu-page__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.resource-menu-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.resource-menu-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>