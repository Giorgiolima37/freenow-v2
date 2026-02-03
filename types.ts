
export enum PaymentMethod {
  CASH = 'Dinheiro',
  CREDIT_CARD = 'Cartão de Crédito',
  DEBIT_CARD = 'Cartão de Débito',
  PIX = 'PIX',
  MONTHLY = 'Fiado (Mensalista)'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string;
  supplier: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  expiryDate: string;
  imageUrl?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  timestamp: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  customerId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number; // Current debt
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export type AppView = 'dashboard' | 'inventory' | 'pos' | 'customers' | 'finance' | 'reports' | 'expiration';
