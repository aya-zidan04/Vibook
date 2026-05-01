import { apiFetch } from '@/api/http';
import type { PaymentMethodResponse } from '@/api/types';

export async function listPaymentMethods(): Promise<PaymentMethodResponse[]> {
  return apiFetch<PaymentMethodResponse[]>('/users/me/payment-methods');
}

export async function addPaymentMethod(body: {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
}): Promise<PaymentMethodResponse> {
  return apiFetch<PaymentMethodResponse>('/users/me/payment-methods', {
    method: 'POST',
    jsonBody: body,
  });
}

export async function deletePaymentMethod(id: number): Promise<void> {
  await apiFetch<void>(`/users/me/payment-methods/${id}`, { method: 'DELETE' });
}

export async function setDefaultPaymentMethod(id: number): Promise<PaymentMethodResponse> {
  return apiFetch<PaymentMethodResponse>(`/users/me/payment-methods/${id}/default`, {
    method: 'PATCH',
  });
}
