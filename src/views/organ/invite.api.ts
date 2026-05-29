/**
 * 机构邀请码 API
 */
import { getHttpClient } from '@/components/http';

export interface OrganInviteGeneratePayload {
  organId: number;
  roleId: number;
  validDays?: number;
}

export interface OrganInviteVo {
  inviteCode: string;
  organId: number;
  organName: string;
  roleId: number;
  roleName: string;
  roleType: string;
  expireAt: string;
}

export class OrganInviteApi {
  static async generate(payload: OrganInviteGeneratePayload): Promise<OrganInviteVo> {
    const http = getHttpClient('default');
    const res = await http.post<OrganInviteVo>('/basis/organ/invite/generate', payload);
    return res.data;
  }
}
