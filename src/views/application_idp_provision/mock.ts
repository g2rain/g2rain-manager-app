/**
 * 外部身份源应用与平台应用的绑定相关 Mock 数据
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
 * 生成符合 ApplicationIdpProvision 类型的 Mock 数据模板
 */
function getApplicationIdpProvisionTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'applicationId': '@integer(1, 100)',
            'idpType|1': ['@word(3,10)', '@word(3,10)'],
            'idpApplicationCode|1': ['@word(3,10)', '@word(3,10)'],
            'remark|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 外部身份源应用与平台应用的绑定相关的 Mock 数据映射
 */
export const ApplicationIdpProvisionMockDataMap: MockDataMap = {
  // GET /application_idp_provision - 根据条件查询列表
  '/application_idp_provision': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const applicationId = query?.applicationId;
    const idpType = query?.idpType;
    const idpApplicationCode = query?.idpApplicationCode;
    const remark = query?.remark;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getApplicationIdpProvisionTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (applicationId) {
      filteredList = filteredList.filter((item: any) => {
                return item.applicationId === applicationId;
              });
    }
    if (idpType) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpType && item.idpType.includes(idpType);
              });
    }
    if (idpApplicationCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpApplicationCode && item.idpApplicationCode.includes(idpApplicationCode);
              });
    }
    if (remark) {
      filteredList = filteredList.filter((item: any) => {
                return item.remark && item.remark.includes(remark);
              });
    }

    return createResult(filteredList);
  },

  // GET /application_idp_provision/list - 根据条件查询列表（兼容接口）
  '/application_idp_provision/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const applicationId = query?.applicationId;
    const idpType = query?.idpType;
    const idpApplicationCode = query?.idpApplicationCode;
    const remark = query?.remark;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getApplicationIdpProvisionTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (applicationId) {
      filteredList = filteredList.filter((item: any) => {
                return item.applicationId === applicationId;
              });
    }
    if (idpType) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpType && item.idpType.includes(idpType);
              });
    }
    if (idpApplicationCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpApplicationCode && item.idpApplicationCode.includes(idpApplicationCode);
              });
    }
    if (remark) {
      filteredList = filteredList.filter((item: any) => {
                return item.remark && item.remark.includes(remark);
              });
    }

    return createResult(filteredList);
  },

  // GET /application_idp_provision/page - 根据条件分页查询
  '/application_idp_provision/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const applicationId = query?.query?.applicationId || query?.applicationId;
    const idpType = query?.query?.idpType || query?.idpType;
    const idpApplicationCode = query?.query?.idpApplicationCode || query?.idpApplicationCode;
    const remark = query?.query?.remark || query?.remark;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getApplicationIdpProvisionTemplate()],
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

  // POST /application_idp_provision/save - 保存（新增或更新）
  '/application_idp_provision/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的外部身份源应用与平台应用的绑定数据
    const ApplicationIdpProvisionItem = Mock.mock(
      getApplicationIdpProvisionTemplate({
        id,
        applicationId: payload.applicationId !== undefined ? payload.applicationId : '@integer(1, 100)',
        idpType: payload.idpType !== undefined ? payload.idpType : '@word(3,10)',
        idpApplicationCode: payload.idpApplicationCode !== undefined ? payload.idpApplicationCode : '@word(3,10)',
        remark: payload.remark !== undefined ? payload.remark : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(ApplicationIdpProvisionItem);
  },

  // DELETE /application_idp_provision/:id - 删除
  '/application_idp_provision/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(ApplicationIdpProvisionMockDataMap);

