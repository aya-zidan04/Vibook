import type { BusinessEventUpsertPayload } from '@/api/businessEventsApi';
import { ApiError } from '@/api/http';

const ENABLED = typeof __DEV__ !== 'undefined' && __DEV__;

export type EventSaveTraceStep = 'create' | 'upload' | 'get' | 'update' | 'deletePhoto';

export function traceEventSaveRequest(
  step: EventSaveTraceStep,
  method: string,
  path: string,
  payload?: unknown,
): void {
  if (!ENABLED) return;
  console.log(`[event-save] → ${step} ${method} ${path}`, payload ?? '(no body)');
}

export function traceEventSaveResponse(step: EventSaveTraceStep, status: number, body: unknown): void {
  if (!ENABLED) return;
  console.log(`[event-save] ← ${step} status=${status}`, body);
}

export function traceEventSaveError(step: EventSaveTraceStep, err: unknown): void {
  if (!ENABLED) return;
  if (err instanceof ApiError) {
    console.warn(`[event-save] ✗ ${step} status=${err.status} message=${err.message}`, err.body);
  } else {
    console.warn(`[event-save] ✗ ${step}`, err);
  }
}

export function logEventSavePayload(label: string, payload: BusinessEventUpsertPayload): void {
  if (!ENABLED) return;
  console.log(`[event-save] payload ${label}:`, JSON.stringify(payload, null, 2));
}
