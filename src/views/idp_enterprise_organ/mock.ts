/**
 * 外部企业相关 Mock 数据
 */

import type { AxiosRequestConfig } from 'axios';
import type { MockDataMap } from '@/components/http/mock-data';
import type { Result } from '@/components/http/types';
import Mock from 'mockjs';
import { mockManager } from '@/components/http/mock-data';

/**
 * 生成符合 Result 格式的响应
 */
function createResult<T>(data: T, status: number = 200): Result<T> {
  // 先使用 Mock.mock 生成元数据，然后直接设置 data，避免 data 被 mock 处理
  const result = Mock.mock({
    requestId: '@guid',
    requestTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    status,
    errorCode: status === 200 ? '' : '@word(5,10)',
    errorMessage: status === 200 ? '' : '@cword(5,15)',
  }) as Result<T>;
  
  // 直接设置 data，不经过 Mock.mock 处理
  result.data = data;
  
  return result;
}

/**
 * 生成符合 IdpEnterpriseOrgan 类型的 Mock 数据模板
 */
function getIdpEnterpriseOrganTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'idpType|1': ['@word(3,10)', '@word(3,10)'],
            'enterpriseId|1': ['@word(3,10)', '@word(3,10)'],
            'bindMode|1': ['INTERNAL', 'THIRD_PARTY'],
            'organId': '@integer(1, 100)',
            'status|1': ['@word(3,10)', '@word(3,10)'],
            'remark|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 外部企业相关的 Mock 数据映射
 */
export const IdpEnterpriseOrganMockDataMap: MockDataMap = {
  // GET /idp_enterprise_organ - 根据条件查询列表
  '/idp_enterprise_organ': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const idpType = query?.idpType;
    const enterpriseId = query?.enterpriseId;
    const organId = query?.organId;
    const status = query?.status;
    const remark = query?.remark;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getIdpEnterpriseOrganTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (idpType) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpType && item.idpType.includes(idpType);
              });
    }
    if (enterpriseId) {
      filteredList = filteredList.filter((item: any) => {
                return item.enterpriseId && item.enterpriseId.includes(enterpriseId);
              });
    }
    if (organId) {
      filteredList = filteredList.filter((item: any) => {
                return item.organId === organId;
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }
    if (remark) {
      filteredList = filteredList.filter((item: any) => {
                return item.remark && item.remark.includes(remark);
              });
    }

    return createResult(filteredList);
  },

  // GET /idp_enterprise_organ/list - 根据条件查询列表（兼容接口）
  '/idp_enterprise_organ/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const idpType = query?.idpType;
    const enterpriseId = query?.enterpriseId;
    const organId = query?.organId;
    const status = query?.status;
    const remark = query?.remark;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getIdpEnterpriseOrganTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (idpType) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpType && item.idpType.includes(idpType);
              });
    }
    if (enterpriseId) {
      filteredList = filteredList.filter((item: any) => {
                return item.enterpriseId && item.enterpriseId.includes(enterpriseId);
              });
    }
    if (organId) {
      filteredList = filteredList.filter((item: any) => {
                return item.organId === organId;
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }
    if (remark) {
      filteredList = filteredList.filter((item: any) => {
                return item.remark && item.remark.includes(remark);
              });
    }

    return createResult(filteredList);
  },

  // GET /idp_enterprise_organ/page - 根据条件分页查询
  '/idp_enterprise_organ/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const idpType = query?.query?.idpType || query?.idpType;
    const enterpriseId = query?.query?.enterpriseId || query?.enterpriseId;
    const organId = query?.query?.organId || query?.organId;
    const status = query?.query?.status || query?.status;
    const remark = query?.query?.remark || query?.remark;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getIdpEnterpriseOrganTemplate()],
    };

    const result = Mock.mock(template);

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);

    const pageData = {
      pageNum,
      pageSize,
      total,
      totalPages,
      records: result.records,
    };

    return createResult(pageData);
  },

  // POST /idp_enterprise_organ/save - 保存（新增或更新）
  '/idp_enterprise_organ/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的外部企业数据
    const IdpEnterpriseOrganItem = Mock.mock(
      getIdpEnterpriseOrganTemplate({
        id,
        idpType: payload.idpType !== undefined ? payload.idpType : '@word(3,10)',
        enterpriseId: payload.enterpriseId !== undefined ? payload.enterpriseId : '@word(3,10)',
        bindMode: payload.bindMode !== undefined ? payload.bindMode : 'INTERNAL',
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        remark: payload.remark !== undefined ? payload.remark : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(IdpEnterpriseOrganItem);
  },

  // DELETE /idp_enterprise_organ/:id - 删除
  '/idp_enterprise_organ/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(IdpEnterpriseOrganMockDataMap);

