import { apiFetch } from '@/api/http';

export type PayPalCreateOrderResponse = {
  paymentId: number;
  bookingId: number;
  eventId: number;
  paypalOrderId: string;
  approvalUrl: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  bookingStatus: string;
};

export type PayPalCaptureOrderResponse = {
  paymentId: number;
  bookingId: number;
  paypalOrderId: string;
  paypalCaptureId: string | null;
  paymentStatus: string;
  bookingStatus: string;
};

export async function createPayPalOrder(body: {
  bookingId: number;
  eventId: number;
  timeSlotId?: number | null;
}): Promise<PayPalCreateOrderResponse> {
  return apiFetch<PayPalCreateOrderResponse>('/payments/paypal/create-order', {
    method: 'POST',
    jsonBody: body,
  });
}

export async function capturePayPalOrder(body: {
  paypalOrderId: string;
  bookingId: number;
}): Promise<PayPalCaptureOrderResponse> {
  return apiFetch<PayPalCaptureOrderResponse>('/payments/paypal/capture-order', {
    method: 'POST',
    jsonBody: body,
  });
}
