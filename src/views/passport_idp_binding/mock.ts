/**
 * 账号与外部身份源绑定表相关 Mock 数据
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
 * 生成符合 PassportIdpBinding 类型的 Mock 数据模板
 */
function getPassportIdpBindingTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'passportId': '@integer(1, 100)',
            'idpType|1': ['@word(3,10)', '@word(3,10)'],
            'idpSubject|1': ['@word(3,10)', '@word(3,10)'],
            'corpId|1': ['@word(3,10)', null],
            'idpUserId|1': ['@word(3,10)', null],
            'idpApplicationCode|1': ['@word(3,10)', '@word(3,10)'],
            'bindMode|1': ['@word(3,10)', null],
            'rawProfile|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 账号与外部身份源绑定表相关的 Mock 数据映射
 */
export const PassportIdpBindingMockDataMap: MockDataMap = {
  // GET /passport_idp_binding - 根据条件查询列表
  '/passport_idp_binding': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const passportId = query?.passportId;
    const idpType = query?.idpType;
    const idpSubject = query?.idpSubject;
    const corpId = query?.corpId;
    const idpUserId = query?.idpUserId;
    const idpApplicationCode = query?.idpApplicationCode;
    const bindMode = query?.bindMode;
    const rawProfile = query?.rawProfile;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getPassportIdpBindingTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (passportId) {
      filteredList = filteredList.filter((item: any) => {
                return item.passportId === passportId;
              });
    }
    if (idpType) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpType && item.idpType.includes(idpType);
              });
    }
    if (idpSubject) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpSubject && item.idpSubject.includes(idpSubject);
              });
    }
    if (corpId) {
      filteredList = filteredList.filter((item: any) => {
                return item.corpId && item.corpId.includes(corpId);
              });
    }
    if (idpUserId) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpUserId && item.idpUserId.includes(idpUserId);
              });
    }
    if (idpApplicationCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpApplicationCode && item.idpApplicationCode.includes(idpApplicationCode);
              });
    }
    if (bindMode) {
      filteredList = filteredList.filter((item: any) => {
                return item.bindMode && item.bindMode.includes(bindMode);
              });
    }
    if (rawProfile) {
      filteredList = filteredList.filter((item: any) => {
                return item.rawProfile && item.rawProfile.includes(rawProfile);
              });
    }

    return createResult(filteredList);
  },

  // GET /passport_idp_binding/list - 根据条件查询列表（兼容接口）
  '/passport_idp_binding/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const passportId = query?.passportId;
    const idpType = query?.idpType;
    const idpSubject = query?.idpSubject;
    const corpId = query?.corpId;
    const idpUserId = query?.idpUserId;
    const idpApplicationCode = query?.idpApplicationCode;
    const bindMode = query?.bindMode;
    const rawProfile = query?.rawProfile;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getPassportIdpBindingTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (passportId) {
      filteredList = filteredList.filter((item: any) => {
                return item.passportId === passportId;
              });
    }
    if (idpType) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpType && item.idpType.includes(idpType);
              });
    }
    if (idpSubject) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpSubject && item.idpSubject.includes(idpSubject);
              });
    }
    if (corpId) {
      filteredList = filteredList.filter((item: any) => {
                return item.corpId && item.corpId.includes(corpId);
              });
    }
    if (idpUserId) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpUserId && item.idpUserId.includes(idpUserId);
              });
    }
    if (idpApplicationCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.idpApplicationCode && item.idpApplicationCode.includes(idpApplicationCode);
              });
    }
    if (bindMode) {
      filteredList = filteredList.filter((item: any) => {
                return item.bindMode && item.bindMode.includes(bindMode);
              });
    }
    if (rawProfile) {
      filteredList = filteredList.filter((item: any) => {
                return item.rawProfile && item.rawProfile.includes(rawProfile);
              });
    }

    return createResult(filteredList);
  },

  // GET /passport_idp_binding/page - 根据条件分页查询
  '/passport_idp_binding/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const passportId = query?.query?.passportId || query?.passportId;
    const idpType = query?.query?.idpType || query?.idpType;
    const idpSubject = query?.query?.idpSubject || query?.idpSubject;
    const corpId = query?.query?.corpId || query?.corpId;
    const idpUserId = query?.query?.idpUserId || query?.idpUserId;
    const idpApplicationCode = query?.query?.idpApplicationCode || query?.idpApplicationCode;
    const bindMode = query?.query?.bindMode || query?.bindMode;
    const rawProfile = query?.query?.rawProfile || query?.rawProfile;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getPassportIdpBindingTemplate()],
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

  // POST /passport_idp_binding/save - 保存（新增或更新）
  '/passport_idp_binding/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的账号与外部身份源绑定表数据
    const PassportIdpBindingItem = Mock.mock(
      getPassportIdpBindingTemplate({
        id,
        passportId: payload.passportId !== undefined ? payload.passportId : '@integer(1, 100)',
        idpType: payload.idpType !== undefined ? payload.idpType : '@word(3,10)',
        idpSubject: payload.idpSubject !== undefined ? payload.idpSubject : '@word(3,10)',
        corpId: payload.corpId !== undefined ? payload.corpId : null,
        idpUserId: payload.idpUserId !== undefined ? payload.idpUserId : null,
        idpApplicationCode: payload.idpApplicationCode !== undefined ? payload.idpApplicationCode : '@word(3,10)',
        bindMode: payload.bindMode !== undefined ? payload.bindMode : null,
        rawProfile: payload.rawProfile !== undefined ? payload.rawProfile : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(PassportIdpBindingItem);
  },

  // DELETE /passport_idp_binding/:id - 删除
  '/passport_idp_binding/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(PassportIdpBindingMockDataMap);

