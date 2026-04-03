import { ApiRequestError } from '@/services/api/http';

export function formatApiErrorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    const fe = err.body?.fieldErrors;
    if (fe && fe.length > 0) {
      return fe.map((f) => `${f.field}: ${f.message}`).join('\n');
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
