/**
 * 租户 IdP 同步 API
 */

import { getHttpClient } from '@/components/http';
import type { TenantIdpSyncPayload, TenantIdpSyncResult } from './type';

export class TenantIdpSyncApi {
  static async sync(payload: TenantIdpSyncPayload): Promise<TenantIdpSyncResult> {
    const http = getHttpClient('default');
    const res = await http.post<TenantIdpSyncResult>('/basis/tenant_idp_sync/sync', payload);
    return res.data;
  }
}
