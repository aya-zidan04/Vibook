import { apiFetch } from '@/api/http';
import type { UserReportCreatedResponse } from '@/api/types';

export type SubmitUserReportBody = {
  subject: string;
  message: string;
};

export async function submitUserReport(body: SubmitUserReportBody): Promise<UserReportCreatedResponse> {
  return apiFetch<UserReportCreatedResponse>('/user-reports', {
    method: 'POST',
    jsonBody: body,
  });
}
