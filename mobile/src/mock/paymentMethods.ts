/** Mock saved card for Payment methods UI (no PCI data — illustrative only). */
export type MockSavedCard = {
  brand: string;
  last4: string;
  maskedNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  productType: string;
  funding: 'credit' | 'debit';
  issuerCountry: string;
  billingLine1: string;
  billingLine2?: string;
  billingCity: string;
  billingCountry: string;
  postalCode: string;
  isDefault: boolean;
};

export const MOCK_PRIMARY_CARD: MockSavedCard = {
  brand: 'Visa',
  last4: '4242',
  maskedNumber: '•••• •••• •••• 4242',
  expiryMonth: '12',
  expiryYear: '28',
  cardholderName: 'Layla Al-Harbi',
  productType: 'Visa Classic',
  funding: 'credit',
  issuerCountry: 'Jordan',
  billingLine1: '12 Rainbow Street',
  billingLine2: 'Building 3, Floor 2',
  billingCity: 'Amman',
  billingCountry: 'Jordan',
  postalCode: '11183',
  isDefault: true,
};
