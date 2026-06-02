/** Stable report reason codes — labels come from `report.reasons.*` i18n keys. */
export const REPORT_REASON_CODES = [
  'spam',
  'abuse',
  'safety',
  'fraud',
  'ip',
  'other',
] as const;

export type ReportReasonCode = (typeof REPORT_REASON_CODES)[number];

export const REPORT_REASON_I18N_KEYS: Record<ReportReasonCode, string> = {
  spam: 'report.reasons.spam',
  abuse: 'report.reasons.abuse',
  safety: 'report.reasons.safety',
  fraud: 'report.reasons.fraud',
  ip: 'report.reasons.ip',
  other: 'report.reasons.other',
};
