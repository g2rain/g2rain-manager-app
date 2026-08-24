<template>
  <div class="control-unit-page">
    <!-- 查询表单 -->
    <el-card class="control-unit-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item :label="$t('MG_CTRL_DOM_FIELD_APP', '所属应用')">
          <el-select v-model="queryForm.applicationId" :placeholder="$t('MG_CTRL_DOM_PH_APP', '请选择所属应用')" clearable style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('MG_CTRL_UNIT_FIELD_NAME', '功能权限名称')">
          <el-input v-model="queryForm.controlUnitName" :placeholder="$t('MG_CTRL_UNIT_PH_NAME', '请输入功能权限名称')" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item :label="$t('MG_CTRL_UNIT_FIELD_SCOPE', '功能权限范围')">
          <DictSelect v-model="queryForm.controlUnitScope" usage-code="CONTROL_UNIT_SCOPE" :api-method="DictItemApi.select" :placeholder="$t('MG_CTRL_UNIT_PH_SCOPE', '请选择功能权限范围')" />
        </el-form-item>

        <!-- 操作按钮 -->
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="control-unit-page__header">
      <div class="control-unit-page__title-group">
        <h2>{{ $t('MG_CTRL_UNIT_TITLE', '管理功能权限数据') }}</h2>
      </div>
      <el-button type="primary" v-permission="'control_unit:add'" @click="handleCreate">{{ $t('MG_CTRL_UNIT_BTN_ADD', '新增功能权限') }}</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('MG_CTRL_UNIT_COL_ID', '功能权限ID')" width="120" />
      <el-table-column prop="applicationId" :label="$t('MG_CTRL_DOM_FIELD_APP', '所属应用')" width="150">
        <template #default="{ row }">
          {{applicationOptions.find(item => item.value === row?.applicationId)?.label || ''}}
        </template>
      </el-table-column>
      <el-table-column prop="controlUnitName" :label="$t('MG_CTRL_UNIT_FIELD_NAME', '功能权限名称')" width="180" />
      <el-table-column prop="description" :label="$t('MG_FIELD_DESC', '描述')" min-width="200" show-overflow-tooltip />
      <el-table-column prop="controlUnitScope" :label="$t('MG_CTRL_UNIT_FIELD_SCOPE', '功能权限范围')" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.controlUnitScope" usage-code="CONTROL_UNIT_SCOPE" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('MG_CTRL_UNIT_FIELD_STATUS', '功能权限状态')" width="180">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            v-permission="'control_unit:status_update'"
            active-value="PUBLISHED"
            inactive-value="UNPUBLISHED"
            usage-code="CONTROL_UNIT_STATUS"
            :api-method="({ nextValue }) => ControlUnitApi.updateStatus(row.id, String(nextValue))"
            @success="loadData"
          />
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'control_unit:edit'" link size="small"
            @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="success" v-permission="'control_unit:resources_config'" link size="small"
            @click="handleConfigureResources(row)">{{ $t('MG_CTRL_UNIT_BTN_RESOURCES', '配置资源') }}</el-button>
          <el-button type="danger" v-permission="'control_unit:delete'" v-if="!row.landing" link size="small"
            @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <!-- 分页组件 -->
    <div class="control-unit-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editDialogTitle" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <!-- 所属应用 -->
        <el-form-item :label="$t('MG_CTRL_DOM_FIELD_APP', '所属应用')" prop="applicationId" v-if="!isEdit">
          <el-select v-model="editForm.applicationId" :placeholder="$t('MG_CTRL_DOM_PH_APP', '请选择所属应用')" style="width: 200px">
            <el-option v-for="item in applicationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('MG_CTRL_UNIT_FIELD_NAME', '功能权限名称')" prop="controlUnitName">
          <el-input v-model="editForm.controlUnitName" :placeholder="$t('MG_CTRL_UNIT_PH_NAME', '请输入功能权限名称')" />
        </el-form-item>

        <el-form-item :label="$t('MG_CTRL_UNIT_FIELD_SCOPE', '功能权限范围')" prop="controlUnitScope">
          <DictSelect v-model="editForm.controlUnitScope" usage-code="CONTROL_UNIT_SCOPE" :disabled="isEdit" :clearable="false" :api-method="DictItemApi.select" :placeholder="$t('MG_CTRL_UNIT_PH_SCOPE', '请选择功能权限范围')" />
        </el-form-item>

        <el-form-item :label="$t('MG_FIELD_DESC', '描述')" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="4" :placeholder="$t('MG_PH_DESC', '请输入描述')" show-word-limit
            maxlength="200" />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 明细弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="$t('MG_CTRL_UNIT_DETAIL', '功能权限明细')" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('MG_CTRL_UNIT_COL_SEQ', '功能权限序号')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_CTRL_DOM_FIELD_APP', '所属应用')">
          {{applicationOptions.find(item => item.value === currentRow?.applicationId)?.label || ''}}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_CTRL_UNIT_FIELD_NAME', '功能权限名称')">{{ currentRow?.controlUnitName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_CTRL_UNIT_FIELD_SCOPE', '功能权限范围')">
          <el-tag>
            <DictText :value="currentRow?.controlUnitScope" usage-code="CONTROL_UNIT_SCOPE" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_CTRL_UNIT_FIELD_STATUS', '功能权限状态')">
          <el-tag>
            <DictText :value="currentRow?.status" usage-code="CONTROL_UNIT_STATUS" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_FIELD_DESC', '描述')">{{ currentRow?.description }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 配置资源 -->
    <el-dialog
      v-model="configureResourcesDialog.visible"
      class="resources-dialog"
      :title="$t('MG_CTRL_UNIT_DLG_RESOURCES', '配置资源')"
      width="900px"
      @closed="resetConfigureResourcesDialog"
    >
      <el-tabs type="border-card" v-model="activeName">
        <!-- 菜单 -->
        <el-tab-pane :label="$t('MG_CTRL_UNIT_TAB_MENU', '菜单资源')" name="menu">
          <el-scrollbar max-height="58vh">
            <el-tree
              v-if="menuTreeData.length > 0"
              ref="menuTreeRef"
              :key="configureResourcesDialog.controlUnitId ?? 'menu-tree'"
              :data="menuTreeData"
              show-checkbox
              node-key="id"
              default-expand-all
              :props="{ label: 'name', children: 'children' }"
            />
          </el-scrollbar>
        </el-tab-pane>

        <!-- 界面 -->
        <el-tab-pane :label="$t('MG_CTRL_UNIT_TAB_VIEW', '界面资源')" name="view">
          <el-scrollbar max-height="58vh">
            <div class="table-wrapper">
              <el-table :data="pages" style="width: 100%">
                <!-- 页面 -->
                <el-table-column :label="$t('MG_CTRL_UNIT_COL_PAGE', '页面')" width="200" header-align="center">
                  <template #default="{ row }">
                    <el-checkbox v-model="row.checked" @change="togglePage(row)">
                      <el-badge class="custom-badge" type="primary"
                        :value="`${getConfiguredCount(row)} / ${row.elements.length}`">
                        <span class="page-badge-target" size="small">{{ row.name }}</span>
                      </el-badge>
                    </el-checkbox>
                  </template>
                </el-table-column>

                <!-- 元素 -->
                <el-table-column :label="$t('MG_CTRL_UNIT_COL_ELEMENT', '元素')" header-align="center">
                  <template #default="{ row }">
                    <div class="elements-row">
                      <div v-for="el in row.elements" :key="el.id" class="element-item">
                        <el-checkbox v-model="el.checked" @change="toggleElement(row, el)" />
                        <DictSelect v-model="el.status" usage-code="RESOURCE_STATUS" :disabled="!el.checked" :clearable="false" :api-method="DictItemApi.select" width="90px" :placeholder="$t('G2_FIELD_STATUS', '状态')" />
                        <span @click.stop="el.checked = !el.checked; toggleElement(row, el)">
                          {{ el.name }}
                        </span>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-scrollbar>
        </el-tab-pane>

        <!-- 接口 -->
        <el-tab-pane :label="$t('MG_CTRL_UNIT_TAB_API', '接口资源')" name="apis">
          <div class="api-toolbar">
            <el-select
              v-model="apiServiceCode"
              clearable
              filterable
              :placeholder="$t('MG_CTRL_UNIT_PH_API_SERVICE', '请选择服务后加载接口')"
              style="width: 260px"
              @change="handleApiServiceChange"
            >
              <el-option
                v-for="item in srvRegistryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="api-toolbar__actions">
              <el-button
                type="primary"
                link
                :disabled="!apiGroups.length"
                @click="handleSelectAllApis"
              >
                {{ $t('MG_CTRL_UNIT_BTN_SELECT_ALL', '全部选中') }}
              </el-button>
              <el-button
                type="primary"
                link
                :disabled="!apiGroups.length"
                @click="handleUnselectAllApis"
              >
                {{ $t('MG_CTRL_UNIT_BTN_UNSELECT_ALL', '全部取消') }}
              </el-button>
            </div>
          </div>
          <el-scrollbar max-height="58vh">
            <!-- 根据接口数据渲染复选框即可 -->
            <div class="api-groups-container">
              <fieldset class="api-fieldset" v-for="group in apiGroups" :key="group.tag">
                <legend class="api-legend">{{ group.tag }}</legend>
                <div class="api-items">
                  <el-checkbox
                    v-for="api in group.items"
                    :key="api.id"
                    v-model="api.checked"
                    class="api-item"
                    @change="toggleApi(api)"
                  >
                    <span class="api-label">
                      <span class="api-name">{{ api.name }}</span>
                      <span class="api-meta">{{ api.method }} {{ api.url }}</span>
                    </span>
                  </el-checkbox>
                  <div
                    v-if="group.items.length % 2 === 1"
                    class="api-item api-item--placeholder"
                    aria-hidden="true"
                  />
                </div>
              </fieldset>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="resetConfigureResourcesDialog">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" @click="configureResources">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { ControlUnitApi } from './api';
import { ApplicationApi } from '../application/api';
import { ResourceMenuApi } from '../resource_menu/api';
import { ResourcePageApi } from '../resource_page/api';
import { ResourcePageElementApi } from '../resource_page_element/api';
import { ResourceApiApi } from '../resource_api/api';
import { ServiceRegistryApi } from '../service_registry/api';
import { ControlUnitResourceRelationApi } from '../control_unit_resource_relation/api';
import { DictItemApi } from '../dict/api';
import type { ControlUnit, ControlUnitPayload, ControlUnitQuery } from './type';
import type { ControlUnitResourceRelationPayload } from '../control_unit_resource_relation/type';
import type { ResourcePage } from '../resource_page/type';
import type { ResourcePageElement } from '../resource_page_element/type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, DictSelect, DictText, StatusSwitch } from '@/components';

// 定义字典引用
const applicationOptions = ref<Array<{ label: string; value: number }>>([]);
const srvRegistryOptions = ref<Array<{ label: string; value: string }>>([]);

// 获取字典信息
const loadDicts = async () => {
  applicationOptions.value = (await ApplicationApi.id2name()).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));
  srvRegistryOptions.value = (await ServiceRegistryApi.list()).map(u => ({
    value: u.serviceCode,
    label: u.name,
  }));
};

// 基础查询状态（使用 reactive v-model 替换整个对象时保持响应式）
let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  applicationId: undefined,
  controlUnitName: '',
  controlUnitScope: '',
});

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ControlUnit[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ControlUnitQuery;

    // 请求分页数据
    const pageData = await ControlUnitApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ControlUnitQuery);
    
    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    ElMessage.error(msg);
  }
};

// 处理排序变化
const handleSortChange = (params: Record<string, string>) => {
  // 更新 QueryForm 的 sorts 字段
  queryFormRef.value?.updateSorts(params);
};

// 查询
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 重置查询条件
const handleReset = () => {
  // 重置基础查询表单
  baseQueryForm.id = undefined;
  baseQueryForm.createTime = undefined;
  baseQueryForm.updateTime = undefined;
  baseQueryForm.sorts = undefined;
  // 重置业务特定查询表单
  queryForm.applicationId = undefined;
  queryForm.controlUnitName = '';
  queryForm.controlUnitScope = '';
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<ControlUnit | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ControlUnit) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ControlUnit) => {
  ElMessageBox.confirm(
    t('MG_CTRL_UNIT_DEL_CONFIRM', `确认删除功能权限「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await ControlUnitApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败');
        ElMessage.error(msg);
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
  applicationId: undefined as number | undefined,
  controlUnitName: '',
  controlUnitScope: '',
  description: '',
});

const editDialogTitle = computed(() =>
  isEdit.value ? t('MG_CTRL_UNIT_DLG_EDIT', '编辑功能权限') : t('MG_CTRL_UNIT_DLG_ADD', '新增功能权限'),
);

// 表单校验规则
const editRules = computed<FormRules>(() => ({
  applicationId: [{ required: true, message: t('MG_CTRL_UNIT_VLD_APP', '请选择归属应用'), trigger: 'blur' }],
  controlUnitName: [{ required: true, message: t('MG_CTRL_UNIT_VLD_NAME', '请输入功能权限名称'), trigger: 'blur' }],
  controlUnitScope: [{ required: true, message: t('MG_CTRL_UNIT_VLD_SCOPE', '请选择功能权限范围'), trigger: 'blur' }],
  description: [{ required: false, message: t('MG_PH_DESC', '请输入描述'), trigger: 'blur' }],
}));

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.applicationId = undefined;
  editForm.controlUnitName = '';
  editForm.controlUnitScope = '';
  editForm.description = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ControlUnit) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.applicationId = row.applicationId;
  editForm.controlUnitName = row.controlUnitName;
  editForm.controlUnitScope = row.controlUnitScope;
  editForm.description = row.description;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ControlUnitPayload = {
    applicationId: editForm.applicationId,
    controlUnitName: editForm.controlUnitName,
    controlUnitScope: editForm.controlUnitScope,
    description: editForm.description,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ControlUnitApi.save(payload);
    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    await loadData();
    editDialogVisible.value = false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
    ElMessage.error(msg);
  }
};
// --------------------关联资源-----------------------------------

// --------------------关联资源-----------------------------------

// `菜单树` 接口
interface MenuTreeItem {
  id: number;
  name: string;
  children?: MenuTreeItem[];
}

// `页面&页面元素` 接口
interface ElementItem {
  id: number;
  name: string;
  checked: boolean;
  status: string;
}

interface Page {
  id: number;
  name: string;
  checked: boolean;
  elements: ElementItem[];
}

// `资源接口` 接口
interface ApiItem {
  id: number
  name: string
  method: string
  url: string
  checked: boolean
}

interface ApiGroup {
  tag: string
  items: ApiItem[]
}

// 1. 菜单树加载
const menuTreeRef = ref<any>(null);
const menuTreeData = ref<MenuTreeItem[]>([]);
// 默认选中节点
const checkedMenuIds = ref<number[]>([]);
// 首次加载的菜单选中状态（与后端关联表 resourceId 一致，用于保存 diff）
let originalMenuIds: number[] = [];

const collectDescendantMenuIds = (node: MenuTreeItem): number[] => {
  const ids: number[] = [];
  node.children?.forEach((child) => {
    ids.push(child.id, ...collectDescendantMenuIds(child));
  });
  return ids;
};

/**
 * 初始化回显：严格对齐关联表，同时保留后续操作的父子联动
 * - 叶子在关联表中 → 勾选
 * - 父节点在关联表中 → 仅当「所有后代也都在关联表中」才勾选父节点，避免只关联部分子菜单时整组被勾满
 */
const resolveMenuCheckedKeysForInit = (tree: MenuTreeItem[], relationIds: number[]): number[] => {
  const relationSet = new Set(relationIds);
  const keys: number[] = [];

  const walk = (node: MenuTreeItem) => {
    const hasChildren = !!node.children?.length;
    if (hasChildren) {
      node.children!.forEach(walk);
      if (relationSet.has(node.id)) {
        const descendants = collectDescendantMenuIds(node);
        if (descendants.length === 0 || descendants.every((id) => relationSet.has(id))) {
          keys.push(node.id);
        }
      }
      return;
    }
    if (relationSet.has(node.id)) {
      keys.push(node.id);
    }
  };

  tree.forEach(walk);
  return keys;
};

// 加载菜单树
const loadMenuTree = async (row: ControlUnit) => {
  try {
    // 调用菜单接口
    const menus = await ResourceMenuApi.list({
      applicationId: row.applicationId
    });

    // 构建树形结构
    const map = new Map<number, MenuTreeItem>();
    const tree: MenuTreeItem[] = [];

    menus.forEach(item => map.set(item.id!, {
      id: item.id!,
      name: item.menuName!,
      children: []
    }));

    menus.forEach(item => {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(map.get(item.id!)!);
      } else {
        tree.push(map.get(item.id!)!);
      }
    });

    const sortTree = (nodes: MenuTreeItem[]) => {
      nodes.sort((a, b) => {
        const menuA = menus.find(m => m.id === a.id);
        const menuB = menus.find(m => m.id === b.id);
        return (menuA?.menuSortOrder || 0) - (menuB?.menuSortOrder || 0);
      });
      nodes.forEach(n => n.children && sortTree(n.children));
    };

    sortTree(tree);
    menuTreeData.value = tree;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('MG_CTRL_UNIT_MSG_MENU_LOAD_FAIL', '加载菜单树失败');
    ElMessage.error(msg);
  }

  // 再加载已选菜单并回显
  const relations = await ControlUnitResourceRelationApi.list({
    controlUnitId: row.id, resourceType: 'MENU'
  })

  const relationIds = relations.map((u) => u.resourceId);
  originalMenuIds = [...relationIds];
  checkedMenuIds.value = resolveMenuCheckedKeysForInit(menuTreeData.value, relationIds);

  await nextTick();
  menuTreeRef.value?.setCheckedKeys(checkedMenuIds.value, false);
};

// 2. 页面&页面元素加载
const pages = reactive<Page[]>([])
// 原始关联页面 ID
let originalPageIds: number[] = []
// 原始关联元素 ID → status
let originalElementMap: Map<number, string> = new Map()

// 加载页面和元素
const loadPagesWithElements = async (row: ControlUnit) => {
  const resourcePages: ResourcePage[] = await ResourcePageApi.list({
    applicationId: row.applicationId
  })

  const resourceElements: ResourcePageElement[] = await ResourcePageElementApi.list({
    applicationId: row.applicationId
  })

  // 清空
  pages.splice(0)

  resourcePages.forEach(p => {
    const elementsForPage = resourceElements.filter(el => el.pageCode === p.pageCode).map(el => ({
      id: el.id,
      name: el.pageElementName,
      checked: false,
      status: 'ENABLED'
    }))

    pages.push({
      id: p.id,
      name: p.pageName,
      checked: false,
      elements: elementsForPage
    })
  })

  // 回显已选元素（如果你要根据 controlUnitId 拉已选关系）
  const pageRelations = await ControlUnitResourceRelationApi.list({
    controlUnitId: row.id,
    resourceType: 'PAGE'
  })

  const elementRelations = await ControlUnitResourceRelationApi.list({
    controlUnitId: row.id,
    resourceType: 'PAGE_ELEMENT'
  })

  originalPageIds = pageRelations.map(r => r.resourceId)
  originalElementMap.clear()
  elementRelations.forEach(r => originalElementMap.set(r.resourceId, r.status || 'ENABLED'))

  pages.forEach(p => {
    // 页面选中
    p.checked = originalPageIds.includes(p.id)

    // 元素选中 + 回写 status
    p.elements.forEach(e => {
      if (originalElementMap.has(e.id)) {
        e.checked = true
        e.status = originalElementMap.get(e.id)!
      }
    })
  })
}

// 切换页面的复选框
const togglePage = (page: Page) => {
  if (page.checked) {
    if (page.elements.every(e => !e.checked)) {
      page.elements.forEach(e => (e.checked = true))
    }

    return
  }

  page.elements.forEach(e => (e.checked = false))
}

// 切换页面元素复选框
const toggleElement = (page: Page, el: ElementItem) => {
  if (!el.checked) {
    return
  }

  if (page.elements.filter(e => e.checked).length === 1) {
    page.checked = true
  }
}

// 获取已配置数量
const getConfiguredCount = (page: Page) =>
  page.elements.filter(e => e.checked).length;

// 3. 接口地址加载
const apiGroups = reactive<ApiGroup[]>([])
// 原始关联页面 ID
let originalApiIds: number[] = []
const selectedApiIds = ref<Set<number>>(new Set())
/** 已加载接口关联的功能权限 ID，换行记录时必须重新拉取 */
let apiRelationsControlUnitId: number | null = null
const apiServiceCode = ref('')
const currentConfigureRow = ref<ControlUnit | null>(null)

const loadApiEndpointRelations = async (row: ControlUnit) => {
  const apiRelations = await ControlUnitResourceRelationApi.list({
    controlUnitId: row.id,
    resourceType: 'API_ENDPOINT',
  })
  originalApiIds = apiRelations.map((r) => r.resourceId)
  selectedApiIds.value = new Set(originalApiIds)
  apiRelationsControlUnitId = row.id!
}

// 加载接口地址
const loadApiEndpoints = async (row: ControlUnit, serviceCode?: string) => {
  if (apiRelationsControlUnitId !== row.id) {
    await loadApiEndpointRelations(row)
  }

  apiGroups.splice(0)
  if (!serviceCode) return;

  const groupMap = new Map<string, ApiItem[]>();
  (await ResourceApiApi.list({ serviceCode })).forEach(api => {
    const tag = api.apiTags || t('MG_CTRL_UNIT_API_UNTAGGED', '未分类');
    if (!groupMap.has(tag)) {
      groupMap.set(tag, [])
    }

    groupMap.get(tag)!.push({
      id: api.id,
      name: api.name,
      method: api.method,
      url: api.path,
      checked: selectedApiIds.value.has(api.id)
    })
  })

  // 赋值
  groupMap.forEach((items, tag) => apiGroups.push({ tag, items }))
}

const handleApiServiceChange = async (serviceCode?: string) => {
  if (!currentConfigureRow.value) return;
  await loadApiEndpoints(currentConfigureRow.value, serviceCode || '');
}

const toggleApi = (api: ApiItem) => {
  if (api.checked) {
    selectedApiIds.value.add(api.id)
    return
  }
  selectedApiIds.value.delete(api.id)
}

const handleSelectAllApis = () => {
  apiGroups.forEach(group => {
    group.items.forEach(api => {
      api.checked = true
      selectedApiIds.value.add(api.id)
    })
  })
}

const handleUnselectAllApis = () => {
  apiGroups.forEach(group => {
    group.items.forEach(api => {
      api.checked = false
      selectedApiIds.value.delete(api.id)
    })
  })
}

// 4. 配置资源弹窗引用
const configureResourcesDialog = reactive({
  visible: false,
  controlUnitId: null as number | null
})

// 5. 重置分配用户弹窗引用
const resetConfigureResourcesDialog = () => {
  // 统一重置弹窗状态，清空数据
  configureResourcesDialog.visible = false
  configureResourcesDialog.controlUnitId = null;
  checkedMenuIds.value = [];
  originalMenuIds = [];
  menuTreeData.value = [];
  originalPageIds = [];
  originalElementMap.clear();
  originalApiIds = [];
  selectedApiIds.value = new Set();
  apiRelationsControlUnitId = null;
  apiServiceCode.value = '';
  currentConfigureRow.value = null;
  apiGroups.splice(0);
}

// 6. 默认选中菜单资源
const activeName = ref('menu')

// 7. 打开配置资源弹窗
const handleConfigureResources = async (row: ControlUnit) => {
  // 先打开弹窗
  configureResourcesDialog.visible = true;
  configureResourcesDialog.controlUnitId = row.id
  currentConfigureRow.value = row;
  apiServiceCode.value = srvRegistryOptions.value[0]?.value || '';

  // 设置默认选中菜单 Tab
  activeName.value = 'menu';

  // ---------- `菜单` 资源初始化 ----------
  await loadMenuTree(row);

  // ---------- `页面和元素` 资源初始化 ----------
  await loadPagesWithElements(row);

  // ---------- `接口地址` 资源初始化 ----------
  await loadApiEndpoints(row, apiServiceCode.value);
}

// 提交配置资源数据
const configureResources = async () => {
  if (!configureResourcesDialog.controlUnitId) return
  const controlUnitId = configureResourcesDialog.controlUnitId;

  try {
    // 1. 定义关联资源行为的数据结构

    // ------------------ 菜单 ------------------
    const menuToCreate: { resourceId: number; resourceType: string }[] = []
    const menuToDelete: { resourceId: number; resourceType: string }[] = []

    // ------------------ 页面 ------------------
    const pageToCreate: { resourceId: number; resourceType: string }[] = []
    const pageToDelete: { resourceId: number; resourceType: string }[] = []

    // ------------------ 元素 ------------------
    const elemToCreate: { resourceId: number; resourceType: string; status: string }[] = []
    const elemToUpdate: { resourceId: number; resourceType: string; status: string }[] = []
    const elemToDelete: { resourceId: number; resourceType: string }[] = []

    // ------------------ 接口 ------------------
    const apisToCreate: { resourceId: number; resourceType: string }[] = []
    const apisToDelete: { resourceId: number; resourceType: string }[] = []

    // 1. 赋值关联资源行为的数据结构

    // ------------------ 菜单 ------------------
    const checkedMenuIds = [
      ...(menuTreeRef.value?.getCheckedKeys(false) || []),
      ...(menuTreeRef.value?.getHalfCheckedKeys() || []),
    ] as number[];
    // 计算新增和删除菜单
    checkedMenuIds.filter(id => !originalMenuIds.includes(id)).forEach(m => {
      menuToCreate.push({ resourceId: m, resourceType: 'MENU' })
    });

    originalMenuIds.filter(id => !checkedMenuIds.includes(id)).forEach(m => {
      menuToDelete.push({ resourceId: m, resourceType: 'MENU' })
    });

    // ------------------ 页面 & 元素 ------------------
    pages.forEach(p => {
      // 页面
      if (p.checked && !originalPageIds.includes(p.id)) {
        pageToCreate.push({ resourceId: p.id, resourceType: 'PAGE' })
      }

      if (!p.checked && originalPageIds.includes(p.id)) {
        pageToDelete.push({ resourceId: p.id, resourceType: 'PAGE' })
      }

      // 元素
      p.elements.forEach(e => {
        // 原始状态
        const oriStatus = originalElementMap.get(e.id)

        // 新增
        if (e.checked && !oriStatus) {
          elemToCreate.push({ resourceId: e.id, resourceType: 'PAGE_ELEMENT', status: e.status })
          return
        }

        // 更新
        if (e.checked && oriStatus !== e.status) {
          elemToUpdate.push({ resourceId: e.id, resourceType: 'PAGE_ELEMENT', status: e.status })
          return
        }

        // 删除
        if (!e.checked && oriStatus) {
          elemToDelete.push({ resourceId: e.id, resourceType: 'PAGE_ELEMENT' })
        }
      })
    })

    // ------------------ 接口 ------------------
    const checkedApiIds = Array.from(selectedApiIds.value)
    // 计算新增和删除接口
    checkedApiIds.filter(id => !originalApiIds.includes(id)).forEach(m => {
      apisToCreate.push({ resourceId: m, resourceType: 'API_ENDPOINT' })
    });

    originalApiIds.filter(id => !checkedApiIds.includes(id)).forEach(m => {
      apisToDelete.push({ resourceId: m, resourceType: 'API_ENDPOINT' })
    });

    // 定义三个关联关系的变量, 需要统一做验证
    const createRelations = [...menuToCreate, ...pageToCreate, ...elemToCreate, ...apisToCreate];
    const updateRelations = [...elemToUpdate];
    const deleteRelations = [...menuToDelete, ...pageToDelete, ...elemToDelete, ...apisToDelete];
    if (createRelations.length === 0 && updateRelations.length === 0 && deleteRelations.length === 0) {
      ElMessage.success(t('MG_CTRL_UNIT_MSG_RESOURCE_OK', '资源更新成功'));
      return;
    }

    const payload: ControlUnitResourceRelationPayload = {
      controlUnitId,
      createRelations,
      updateRelations,
      deleteRelations
    };
    await ControlUnitResourceRelationApi.save(payload);
    ElMessage.success(t('MG_CTRL_UNIT_MSG_RESOURCE_OK', '资源更新成功'));
    resetConfigureResourcesDialog();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('MG_CTRL_UNIT_MSG_RESOURCE_FAIL', '菜单资源更新失败');
    ElMessage.error(msg);
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
.resources-dialog :deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  margin: 8vh auto !important;
}

.table-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  overflow: hidden;
}

.table-wrapper :deep(.el-table__inner-wrapper::before) {
  display: none !important;
}

.table-wrapper :deep(.el-table__row:last-child td.el-table__cell) {
  border-bottom: none !important;
}

.table-wrapper :deep(.el-table th.el-table__cell) {
  font-weight: 600;
  color: #2c2c2c;
}

/* 允许单元格内容向上溢出 */
.table-wrapper :deep(.el-table .cell) {
  overflow: visible;
}

.elements-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  row-gap: 16px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.element-item span {
  cursor: pointer;
}

.element-item span:hover {
  color: var(--el-color-primary);
}

.custom-badge .el-badge__content {
  font-weight: bold;
  top: -0.5em;
  right: -0.5em;
  padding: 0;
  min-width: 0;
  height: auto;
  line-height: 1;
  font-size: 10px;
}

.page-badge-target {
  display: inline-flex;
  align-items: center;
  padding: 7px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  font-size: 13px;
  position: relative;
  overflow: visible;
}

.api-groups-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.api-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.api-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.api-fieldset {
  border: 1px solid #e0e3eb;
  border-radius: 12px;
  padding: 16px;
  position: relative;
}

.api-legend {
  padding: 0 12px;
  font-weight: 600;
  font-size: 14px;
  color: #2c2c2c;
  margin-left: 40px;
}

.api-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 0;
  row-gap: 6px;
  margin-top: 8px;
}

.api-item {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
  font-size: 14px;
}

/* 主应用全局 .el-checkbox 固定高度会压掉上下 padding，需提高优先级 */
.api-items label.api-item.el-checkbox {
  height: auto;
  padding-top: 10px;
  padding-bottom: 10px;
}

.api-item:nth-child(odd) {
  border-radius: 8px 0 0 8px;
  padding-left: 10px;
}

.api-item:nth-child(even) {
  border-radius: 0 8px 8px 0;
  padding-right: 10px;
}

.api-item:nth-child(4n + 1),
.api-item:nth-child(4n + 2) {
  background-color: var(--el-fill-color-light);
}

.api-item:nth-child(4n + 3),
.api-item:nth-child(4n + 4) {
  background-color: transparent;
}

.api-item--placeholder {
  pointer-events: none;
  padding-top: 10px;
  padding-bottom: 10px;
}

.api-item :deep(.el-checkbox__label) {
  width: 100%;
  line-height: 1.4;
  padding-top: 0;
  padding-bottom: 0;
}

.api-name {
  font-weight: 500;
  color: #2c2c2c;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.api-label {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  row-gap: 2px;
  min-width: 0;
  flex: 1;
  justify-content: center;
}

.api-meta {
  font-size: 12px;
  color: #6e6e6e;
  margin-left: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.control-unit-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.control-unit-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.control-unit-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-unit-page__header h2 {
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

.control-unit-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.control-unit-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>