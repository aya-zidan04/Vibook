import { apiFetch } from '@/api/http';
import type { ModerationReportCreatedResponse, ModerationReportType } from '@/api/types';

export type SubmitModerationReportBody = {
  targetType: ModerationReportType;
  targetId?: number | null;
  reason: string;
  description?: string | null;
};

export async function submitModerationReport(
  body: SubmitModerationReportBody,
): Promise<ModerationReportCreatedResponse> {
  return apiFetch<ModerationReportCreatedResponse>('/reports', {
    method: 'POST',
    jsonBody: body,
  });
}
