<template>
  <div class="application-page">
    <!-- 查询表单 -->
    <el-card class="application-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('MG_FIELD_ORGAN', '所属机构')">
          <OrganSelect v-model="queryForm.organId" :api-method="OrganApi.searchOrgans" :placeholder="$t('MG_PH_ORGAN', '请选择所属机构')" width="200px" />
        <!-- 业务特定查询字段 -->
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_TYPE', '应用类型')">
          <DictSelect v-model="queryForm.applicationType" usage-code="APPLICATION_TYPE" :api-method="DictItemApi.select" :placeholder="$t('MG_APP_PH_TYPE', '请选择应用类型')" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_NAME', '应用名称')">
          <el-input v-model="queryForm.applicationName" :placeholder="$t('MG_APP_PH_NAME', '请输入应用名称')" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_CODE', '应用编码')">
          <el-input v-model="queryForm.applicationCode" :placeholder="$t('MG_APP_PH_CODE', '请输入应用编码')" clearable style="width: 200px" />
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
    <div class="application-page__header">
      <div class="application-page__title-group">
        <h2>{{ $t('MG_APP_TITLE', '管理应用数据') }}</h2>
      </div>
      <el-button type="primary" v-permission="'application:add'" @click="handleCreate">{{ $t('MG_APP_BTN_ADD', '新增应用') }}</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true"
      @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('MG_APP_COL_ID', '应用标识')" width="140" />
      <el-table-column prop="organName" :label="$t('MG_FIELD_ORGAN', '所属机构')" width="140" />

      <el-table-column prop="applicationType" :label="$t('MG_APP_FIELD_TYPE', '应用类型')" width="180">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.applicationType" usage-code="APPLICATION_TYPE" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="applicationName" :label="$t('MG_APP_FIELD_NAME', '应用名称')" width="180" />

      <el-table-column prop="applicationCode" :label="$t('MG_APP_FIELD_CODE', '应用编码')" width="180" />

      <el-table-column prop="status" :label="$t('MG_APP_FIELD_STATUS', '应用状态')" width="180">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            v-permission="'application:status_update'"
            active-value="PUBLISHED"
            inactive-value="UNPUBLISHED"
            :options="statusOptions"
            :api-method="({ nextValue }) => ApplicationApi.updateStatus(row.id, String(nextValue))"
            @success="loadData"
          />
        </template>
      </el-table-column>

      <el-table-column prop="canIntegrate" :label="$t('MG_APP_FIELD_CAN_INTEGRATE', '支持集成')" width="140">
        <template #default="{ row }">
          <el-tag effect="light">
            <DictText :value="row?.canIntegrate" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
          </el-tag>
        </template>
      </el-table-column>

      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" :sortable="true" />

      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" :sortable="true" />

      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="380">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'application:edit'" link size="small"
            @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="success" v-permission="'application:integrate'" link size="small"
            v-if="row.canIntegrate" @click="handleIntegrate(row)">{{ $t('MG_APP_BTN_INTEGRATE', '关联应用') }}</el-button>
          <el-button type="success" link size="small" v-permission="'application:public_key_config'"
            @click="handlePubKeyConfig(row)">{{ $t('MG_APP_BTN_PUBKEY', '公钥配置') }}</el-button>
          <el-button type="success" link size="small" v-permission="'application:idp_provision_config'"
            @click="handleIdpProvisionConfig(row)">{{ $t('MG_APP_BTN_IDP_PROVISION', '三方应用配置') }}</el-button>
          <el-button type="danger" v-permission="'application:delete'" v-if="!row.landing" link size="small"
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
    <div class="application-page__pagination">
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editDialogTitle" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="150px">
        <el-form-item :label="$t('MG_FIELD_ORGAN', '所属机构')" prop="organId">
          <OrganSelect v-model="editForm.organId" :disabled="isEdit" :api-method="OrganApi.searchOrgans" :placeholder="$t('MG_PH_ORGAN', '请选择所属机构')" width="200px" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_TYPE', '应用类型')" prop="applicationType">
          <DictSelect v-model="editForm.applicationType" usage-code="APPLICATION_TYPE" :api-method="DictItemApi.select" :clearable="false" :placeholder="$t('MG_APP_PH_TYPE', '请选择应用类型')" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_CAN_INTEGRATE', '支持集成')" prop="canIntegrate">
          <el-radio-group v-model="editForm.canIntegrate">
            <el-radio v-for="option in boolOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_API_KEY', '支持API密钥')" prop="apiKeySupported">
          <el-radio-group v-model="editForm.apiKeySupported">
            <el-radio v-for="option in boolOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_NAME', '应用名称')" prop="applicationName">
          <el-input v-model="editForm.applicationName" :placeholder="$t('MG_APP_PH_NAME', '请输入应用名称')" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_CODE', '应用编码')" prop="applicationCode">
          <el-input v-model="editForm.applicationCode" :placeholder="$t('MG_APP_PH_CODE', '请输入应用编码')" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_ACCESS_TOKEN_EXP', '访问令牌有效期(秒)')" prop="accessTokenExpiresIn">
          <el-input-number v-model="editForm.accessTokenExpiresIn" :min="0" :step="1" :placeholder="$t('MG_APP_PH_ACCESS_TOKEN', '访问令牌有效期 (秒)')" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_REFRESH_TOKEN_EXP', '刷新令牌有效期(秒)')" prop="refreshTokenExpiresIn">
          <el-input-number v-model="editForm.refreshTokenExpiresIn" :min="0" :step="1" :placeholder="$t('MG_APP_PH_REFRESH_TOKEN', '刷新令牌有效期 (秒)')" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_ENDPOINT', '应用地址')" prop="endpointUrl">
          <el-input v-model="editForm.endpointUrl" :placeholder="$t('MG_APP_PH_ENDPOINT', '请输入应用地址')" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_CONTEXT_PATH', '应用路径')" prop="contextPath">
          <el-input v-model="editForm.contextPath" :placeholder="$t('MG_APP_PH_CONTEXT_PATH', '请输入应用路径')" />
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_REMARK', '备注')" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="4" :placeholder="$t('MG_APP_PH_REMARK', '请输入备注信息')" show-word-limit
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

    <el-dialog v-model="detailDialogVisible" :title="$t('MG_APP_DETAIL', '应用明细')" width="520px">
    <!-- 明细弹窗 -->
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('MG_FIELD_ORGAN', '所属机构')">{{ currentRow?.organName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_TYPE', '应用类型')">
          <DictText :value="currentRow?.applicationType" usage-code="APPLICATION_TYPE" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_CAN_INTEGRATE', '支持集成')">
          <el-tag :type="currentRow?.canIntegrate ? 'success' : 'info'">
            <DictText :value="currentRow?.canIntegrate" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_API_KEY', '支持API密钥')">
          <el-tag :type="currentRow?.apiKeySupported ? 'success' : 'info'">
            <DictText :value="currentRow?.apiKeySupported" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_NAME', '应用名称')">{{ currentRow?.applicationName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_CODE', '应用编码')">{{ currentRow?.applicationCode }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_STATUS', '应用状态')">
          <el-tag>
            <DictText :value="currentRow?.status" usage-code="APPLICATION_STATUS" :api-method="DictItemApi.select" />
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_ACCESS_TOKEN_EXP', '访问令牌有效期(秒)')">{{ currentRow?.accessTokenExpiresIn }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_REFRESH_TOKEN_EXP', '刷新令牌有效期(秒)')">{{ currentRow?.refreshTokenExpiresIn }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_ENDPOINT', '应用地址')">{{ currentRow?.endpointUrl }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_CONTEXT_PATH', '应用路径')">{{ currentRow?.contextPath }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MG_APP_FIELD_REMARK', '备注')">{{ currentRow?.description }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关联主应用弹窗 -->
    <el-dialog v-model="integrateDialog.visible" :title="$t('MG_APP_DLG_INTEGRATE', '关联应用')" width="520px">
      <el-checkbox-group v-model="selectedApplications" class="checkbox-grid">
        <el-checkbox v-for="item in mainApplications" :key="item.value" :value="item.value" size="small">
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetIntegrateDialog">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitIntegrate">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="pubKeyConfigDialog.visible" :title="$t('MG_APP_DLG_PUBKEY', '公钥配置')" width="520px">
    <!-- 公钥配置 -->
      <el-form :model="pubKeyForm" label-width="100px">
        <el-form-item :label="$t('MG_APP_FIELD_PUBKEY_ALG', '公钥算法')">
          <DictSelect v-model="pubKeyForm.algorithm" usage-code="KEY_ALGORITHM" :api-method="DictItemApi.select" :clearable="false" :placeholder="$t('MG_APP_PH_ALG', '请选择算法')" />
        <!-- 公钥算法（仅上传时需要） -->
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_CURRENT_PUBKEY', '当前公钥')">
        <!-- 当前公钥状态 + 下载 -->
          <el-space>
            <el-tag v-if="pubKeyConfigDialog.hasPublicKey" type="success">{{ $t('MG_APP_PUBKEY_CONFIGURED', '已配置') }}</el-tag>
            <el-tag v-else type="info">{{ $t('MG_APP_PUBKEY_NOT_CONFIGURED', '未配置') }}</el-tag>
            <el-button v-if="pubKeyConfigDialog.hasPublicKey" type="primary" link @click="downloadPublicKey">
              {{ $t('MG_APP_BTN_DOWNLOAD_PUBKEY', '下载公钥') }}
            </el-button>
          </el-space>
        </el-form-item>

        <el-form-item :label="$t('MG_APP_FIELD_UPLOAD_PUBKEY', '上传公钥')">
        <!-- 上传公钥 -->
          <el-upload :auto-upload="false" :limit="1" accept=".pem,.der" :on-change="handlePubKeyFileChange">
            <el-button>{{ $t('MG_APP_BTN_SELECT_FILE', '选择文件') }}</el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="pubKeyConfigDialog.visible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" :disabled="!pubKeyForm.file" @click="submitPublicKey">
          {{ $t('G2_BTN_SAVE', '保存') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 三方应用配置 -->
    <el-drawer
      v-model="idpProvisionDialog.visible"
      :title="idpProvisionDrawerTitle"
      direction="rtl"
      size="720px"
      destroy-on-close
      @closed="idpProvisionRows = []"
    >
      <div style="margin-bottom: 12px;">
        <el-button type="primary" v-permission="'application_idp_provision:add'" @click="handleIdpProvisionCreate">
          {{ $t('MG_APP_IDP_BTN_ADD_BIND', '新增绑定') }}
        </el-button>
      </div>
      <el-table :data="idpProvisionRows" border stripe style="width: 100%">
        <el-table-column prop="idpType" :label="$t('MG_APP_IDP_FIELD_IDP_TYPE', '身份源类型')" width="140">
          <template #default="{ row: provision }">
            <el-tag effect="light" size="small">
              <DictText :value="provision?.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" />
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="idpApplicationCode" :label="$t('MG_APP_IDP_FIELD_IDP_APP_CODE', 'IDP侧应用ID')" min-width="180" />
        <el-table-column prop="remark" :label="$t('MG_APP_IDP_FIELD_REMARK', '备注')" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="170" />
        <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" width="140" fixed="right">
          <template #default="{ row: provision }">
            <el-button type="primary" v-permission="'application_idp_provision:edit'" link size="small"
              @click="handleIdpProvisionEdit(provision)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
            <el-button type="danger" v-permission="'application_idp_provision:delete'" link size="small"
              @click="handleIdpProvisionDelete(provision)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button type="primary" @click="idpProvisionDialog.visible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
      </template>
    </el-drawer>

    <!-- 三方应用配置 - 新增/编辑 -->
    <el-dialog
      v-model="idpProvisionEditVisible"
      :title="idpProvisionEditDialogTitle"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="idpProvisionEditFormRef" :model="idpProvisionEditForm" :rules="idpProvisionEditRules" label-width="160px">
        <el-form-item :label="$t('MG_APP_IDP_COL_APP_ID', '应用ID')">
          <el-input :model-value="String(idpProvisionDialog.applicationId ?? '')" disabled />
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_IDP_TYPE', '身份源类型')" prop="idpType">
          <DictSelect v-model="idpProvisionEditForm.idpType" usage-code="PASSPORT_IDP_TYPE" :api-method="DictItemApi.select" :clearable="false" :placeholder="$t('MG_APP_IDP_PH_IDP_TYPE', '请选择身份源类型')" />
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_IDP_APP_CODE', 'IDP侧应用ID')" prop="idpApplicationCode">
          <el-input v-model="idpProvisionEditForm.idpApplicationCode" :placeholder="$t('MG_APP_IDP_PH_IDP_APP_CODE', '请输入IDP侧应用ID')" />
        </el-form-item>
        <el-form-item :label="$t('MG_APP_IDP_FIELD_REMARK', '备注')" prop="remark">
          <el-input v-model="idpProvisionEditForm.remark" type="textarea" :rows="3" :placeholder="$t('MG_APP_IDP_PH_REMARK', '请输入备注')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="idpProvisionEditVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" @click="submitIdpProvisionEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { FormInstance, FormRules, UploadFile } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { ApplicationApi } from './api';
import { OrganApi } from '../organ/api';
import { DictItemApi, parseDictCodeAsBoolean } from '../dict/api';
import { ApplicationSuiteApi } from '../application_suite/api';
import { ApplicationIdpProvisionApi } from '../application_idp_provision/api';
import type { Application, ApplicationPayload, ApplicationQuery } from './type';
import type { ApplicationIdpProvision, ApplicationIdpProvisionPayload } from '../application_idp_provision/type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm, OrganSelect, DictSelect, DictText, StatusSwitch } from '@/components';

// 定义字典引用
const statusOptions = ref<Array<{ label: string; value: string }>>([]);
const boolOptions = ref<Array<{ label: string; value: boolean }>>([]);

// 获取字典信息
const loadDicts = async () => {
  try {
    const items = await DictItemApi.loadByUsageCode('APPLICATION_STATUS');
    statusOptions.value = [...items]
      .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
      .map((item) => ({
        label: item.name || String(item.code),
        value: String(item.code),
      }));
  } catch (error) {
    console.error('加载应用状态字典失败:', error);
    statusOptions.value = [];
  }

  try {
    const items = await DictItemApi.loadByUsageCode('BOOLEAN_FLAG');
    boolOptions.value = [...items]
      .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
      .map((item) => {
        const value = parseDictCodeAsBoolean(String(item.code));
        if (value === undefined) return null;
        return {
          label: item.name || String(item.code),
          value,
        };
      })
      .filter((item): item is { label: string; value: boolean } => item !== null);
  } catch (error) {
    console.error('加载布尔字典失败:', error);
    boolOptions.value = [];
  }
};

// 基础查询状态（使用 reactive 以确保 v-model 的双向绑定完全生效）
let baseQueryForm = reactive<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  organId: undefined,
  applicationType: '',
  applicationName: '',
  applicationCode: '',
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
const tableData = ref<Application[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ApplicationQuery;

    // 请求分页数据
    const pageData = await ApplicationApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ApplicationQuery);
    
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
  queryForm.organId = undefined;
  queryForm.applicationName = '';
  queryForm.applicationCode = '';
  queryForm.applicationType = '';
  pagination.pageNum = 1; // 重置到第一页
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1; // 重置到第一页
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 调整页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<Application | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: Application) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: Application) => {
  ElMessageBox.confirm(
    t('MG_APP_DEL_CONFIRM', `确认删除应用「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await ApplicationApi.remove(row.id);
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
  organId: undefined as number | undefined,
  applicationType: 'SYSTEM',
  applicationName: '',
  applicationCode: '',
  canIntegrate: true,
  apiKeySupported: false,
  accessTokenExpiresIn: undefined as number | undefined,
  refreshTokenExpiresIn: undefined as number | undefined,
  endpointUrl: '',
  contextPath: '',
  description: '',
});

const editDialogTitle = computed(() =>
  isEdit.value ? t('MG_APP_DLG_EDIT', '编辑应用') : t('MG_APP_DLG_ADD', '新增应用'),
);

// 表单校验规则
const editRules = computed<FormRules>(() => ({
  organId: [{ required: true, message: t('MG_APP_VLD_ORGAN', '请选择所属机构'), trigger: 'blur' }],
  applicationType: [{ required: true, message: t('MG_APP_VLD_TYPE', '请选择应用类型'), trigger: 'blur' }],
  applicationName: [{ required: true, message: t('MG_APP_VLD_NAME', '请输入应用名称'), trigger: 'blur' }],
  applicationCode: [{ required: false, message: t('MG_APP_PH_CODE', '请输入应用编码'), trigger: 'blur' }],
  canIntegrate: [{ required: true, message: t('MG_APP_VLD_CAN_INTEGRATE', '请选择支持集成'), trigger: 'blur' }],
  apiKeySupported: [{ required: true, message: t('MG_APP_VLD_API_KEY', '请选择是否支持API密钥'), trigger: 'blur' }],
  accessTokenExpiresIn: [{ required: true, message: t('MG_APP_VLD_ACCESS_TOKEN', '请输入访问令牌有效期'), trigger: 'blur' }],
  refreshTokenExpiresIn: [{ required: true, message: t('MG_APP_VLD_REFRESH_TOKEN', '请输入刷新令牌有效期'), trigger: 'blur' }],
  endpointUrl: [{ required: true, message: t('MG_APP_VLD_ENDPOINT', '请输入应用地址'), trigger: 'blur' }],
  contextPath: [{ required: false, message: t('MG_APP_PH_CONTEXT_PATH', '请输入应用路径'), trigger: 'blur' }],
  description: [{ required: false, message: t('MG_APP_PH_CONTEXT_PATH', '请输入应用路径'), trigger: 'blur' }],
}));

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.organId = undefined;
  editForm.applicationType = 'SYSTEM';
  editForm.applicationName = '';
  editForm.applicationCode = '';
  editForm.canIntegrate = true;
  editForm.apiKeySupported = false;
  editForm.accessTokenExpiresIn = 3600;
  editForm.refreshTokenExpiresIn = 86400;
  editForm.endpointUrl = '';
  editForm.contextPath = '';
  editForm.description = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: Application) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.applicationType = row.applicationType;
  editForm.applicationName = row.applicationName;
  editForm.applicationCode = row.applicationCode;
  editForm.canIntegrate = row.canIntegrate;
  editForm.apiKeySupported = row.apiKeySupported;
  editForm.accessTokenExpiresIn = row.accessTokenExpiresIn;
  editForm.refreshTokenExpiresIn = row.refreshTokenExpiresIn;
  editForm.endpointUrl = row.endpointUrl;
  editForm.contextPath = row.contextPath;
  editForm.description = row.description;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ApplicationPayload = {
    organId: editForm.organId,
    applicationName: editForm.applicationName,
    applicationCode: editForm.applicationCode,
    canIntegrate: editForm.canIntegrate,
    apiKeySupported: editForm.apiKeySupported,
    applicationType: editForm.applicationType,
    accessTokenExpiresIn: editForm.accessTokenExpiresIn,
    refreshTokenExpiresIn: editForm.refreshTokenExpiresIn,
    endpointUrl: editForm.endpointUrl,
    contextPath: editForm.contextPath,
    description: editForm.description,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ApplicationApi.save(payload);
    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    await loadData();
    editDialogVisible.value = false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
    ElMessage.error(msg);
  }
};

// 关联应用组件引用  
const mainApplications = ref<{ value: number; label: string }[]>([])
const selectedApplications = ref<number[]>([])
// 原始已关联应用列表（用于比较删除项）
let originalApplications: Set<number> = new Set()

const integrateDialog = reactive({
  visible: false,
  applicationId: null as number | null
})

const resetIntegrateDialog = () => {
  // 统一重置弹窗状态，清空数据
  integrateDialog.visible = false
  integrateDialog.applicationId = null
  mainApplications.value = []
  selectedApplications.value = []
  originalApplications.clear()
}

const handleIntegrate = async (row: Application) => {
  const currentApplicationId = row.id
  integrateDialog.applicationId = currentApplicationId
  integrateDialog.visible = true

  // 查询待选应用列表
  mainApplications.value = (await ApplicationApi.id2name({ canIntegrate: false })).map(u => ({
    value: u.id,
    label: u.applicationName || `${u.id}`
  }));

  // 查询角色关联应用
  const associatedApplications = (await ApplicationSuiteApi.list({
    applicationId: currentApplicationId
  })).map(u => u.masterApplicationId);
  selectedApplications.value = [...associatedApplications]

  // 保存原始关联应用集合，用于删除对比
  originalApplications = new Set(associatedApplications)
};

const submitIntegrate = async () => {
  if (!integrateDialog.applicationId) return

  const masterApplicationIds = selectedApplications.value.filter(id => !originalApplications.has(id))                 // 新增
  const deleteMasterApplicationIds = [...originalApplications].filter(id => !selectedApplications.value.includes(id)) // 删除

  await ApplicationSuiteApi.save({
    applicationId: integrateDialog.applicationId,
    masterApplicationIds,         // 新增应用
    deleteMasterApplicationIds    // 待删应用
  })

  ElMessage.success(t('MG_APP_MSG_INTEGRATE_OK', '关联成功'))
  resetIntegrateDialog()
};

// Dialog 状态
const pubKeyConfigDialog = reactive({
  visible: false,
  applicationId: null as number | null,
  hasPublicKey: false
})

// 表单数据
const pubKeyForm = reactive({
  algorithm: '',
  file: null as File | null
})

const handlePubKeyConfig = async (row: Application) => {
  pubKeyConfigDialog.visible = true;
  pubKeyConfigDialog.applicationId = row.id;
  pubKeyConfigDialog.hasPublicKey = (await ApplicationApi.hasPublicKey(row.id));
  pubKeyForm.algorithm = 'EC';
  pubKeyForm.file = null;
}

// 文件选择
const handlePubKeyFileChange = (uploadFile: UploadFile) => {
  // uploadFile 是 Element Plus 封装的对象
  // uploadFile.raw 才是浏览器原生的 File 对象
  pubKeyForm.file = uploadFile?.raw || null;
};

// 提交上传
const submitPublicKey = async () => {
  if (!pubKeyConfigDialog.applicationId) {
    ElMessage.error(t('MG_APP_MSG_APP_ID_MISSING', '应用ID不存在'))
    return
  }

  if (!pubKeyForm.file) {
    ElMessage.error(t('MG_APP_MSG_SELECT_PUBKEY', '请选择公钥文件'))
    return
  }

  const formData = new FormData();
  formData.append('publicKeyAlgorithm', pubKeyForm.algorithm);
  formData.append('file', pubKeyForm.file);
  await ApplicationApi.uploadPublicKey(pubKeyConfigDialog.applicationId, formData);
  ElMessage.success(t('MG_APP_MSG_PUBKEY_UPLOAD_OK', '公钥上传成功'));
  pubKeyConfigDialog.visible = false;
}

// 下载公钥（不关心算法）
const downloadPublicKey = () => {
  if (!pubKeyConfigDialog.applicationId) {
    return
  }

  ApplicationApi.downloadPublicKey(pubKeyConfigDialog.applicationId)
}

// 三方应用配置
const idpProvisionDialog = reactive({
  visible: false,
  applicationId: null as number | null,
  applicationName: '',
});

const idpProvisionDrawerTitle = computed(() =>
  `${t('MG_APP_IDP_DRAWER_TITLE', '三方应用配置')} - ${idpProvisionDialog.applicationName}`,
);

const idpProvisionRows = ref<ApplicationIdpProvision[]>([]);
const idpProvisionEditVisible = ref(false);
const idpProvisionIsEdit = ref(false);
const idpProvisionEditFormRef = ref<FormInstance | null>(null);

const idpProvisionEditForm = reactive({
  id: undefined as number | undefined,
  idpType: '',
  idpApplicationCode: '',
  remark: '',
});

const idpProvisionEditDialogTitle = computed(() =>
  idpProvisionIsEdit.value
    ? t('MG_APP_IDP_DLG_EDIT_BIND', '编辑三方应用绑定')
    : t('MG_APP_IDP_DLG_ADD_BIND', '新增三方应用绑定'),
);

const idpProvisionEditRules = computed<FormRules>(() => ({
  idpType: [{ required: true, message: t('MG_APP_IDP_VLD_IDP_TYPE', '请选择身份源类型'), trigger: 'change' }],
  idpApplicationCode: [{ required: true, message: t('MG_APP_IDP_VLD_IDP_APP_CODE', '请输入IDP侧应用ID'), trigger: 'blur' }],
}));

const loadIdpProvisionList = async () => {
  if (!idpProvisionDialog.applicationId) {
    return;
  }
  try {
    idpProvisionRows.value = await ApplicationIdpProvisionApi.list({
      applicationId: idpProvisionDialog.applicationId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('MG_APP_IDP_LOAD_FAIL', '加载三方应用配置失败');
    ElMessage.error(msg);
  }
};

const handleIdpProvisionConfig = async (row: Application) => {
  idpProvisionDialog.visible = true;
  idpProvisionDialog.applicationId = row.id;
  idpProvisionDialog.applicationName = row.applicationName;
  idpProvisionRows.value = [];
  await loadIdpProvisionList();
};

const handleIdpProvisionCreate = () => {
  idpProvisionIsEdit.value = false;
  idpProvisionEditFormRef.value?.clearValidate();
  idpProvisionEditForm.id = undefined;
  idpProvisionEditForm.idpType = '';
  idpProvisionEditForm.idpApplicationCode = '';
  idpProvisionEditForm.remark = '';
  idpProvisionEditVisible.value = true;
};

const handleIdpProvisionEdit = (row: ApplicationIdpProvision) => {
  idpProvisionIsEdit.value = true;
  idpProvisionEditFormRef.value?.clearValidate();
  idpProvisionEditForm.id = row.id;
  idpProvisionEditForm.idpType = row.idpType;
  idpProvisionEditForm.idpApplicationCode = row.idpApplicationCode;
  idpProvisionEditForm.remark = row.remark ?? '';
  idpProvisionEditVisible.value = true;
};

const handleIdpProvisionDelete = (row: ApplicationIdpProvision) => {
  ElMessageBox.confirm(
    t('MG_APP_IDP_DEL_CONFIRM_BIND', `确认删除三方应用绑定「${row.id}」吗？`),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await ApplicationIdpProvisionApi.remove(row.id);
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
        await loadIdpProvisionList();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败');
        ElMessage.error(msg);
      }
    })
    .catch(() => {});
};

const submitIdpProvisionEdit = async () => {
  if (!idpProvisionEditFormRef.value || !idpProvisionDialog.applicationId) {
    return;
  }
  if (!(await idpProvisionEditFormRef.value.validate())) {
    return;
  }

  const payload: ApplicationIdpProvisionPayload = {
    applicationId: idpProvisionDialog.applicationId,
    idpType: idpProvisionEditForm.idpType,
    idpApplicationCode: idpProvisionEditForm.idpApplicationCode,
    remark: idpProvisionEditForm.remark,
  };
  if (idpProvisionIsEdit.value) {
    payload.id = idpProvisionEditForm.id;
  }

  try {
    await ApplicationIdpProvisionApi.save(payload);
    ElMessage.success(idpProvisionIsEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    idpProvisionEditVisible.value = false;
    await loadIdpProvisionList();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
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
.application-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.application-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.application-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.application-page__header h2 {
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

.application-page__search {
  margin-bottom: 12px;
  background-color: #fff;
}

.application-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
