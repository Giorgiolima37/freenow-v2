
import { Product, Sale, Customer, Expense } from './types';

const KEYS = {
  PRODUCTS: 'mf_products',
  SALES: 'mf_sales',
  CUSTOMERS: 'mf_customers',
  EXPENSES: 'mf_expenses'
};

export const db = {
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  saveProducts: (data: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data)),
  
  getSales: (): Sale[] => JSON.parse(localStorage.getItem(KEYS.SALES) || '[]'),
  saveSales: (data: Sale[]) => localStorage.setItem(KEYS.SALES, JSON.stringify(data)),
  
  getCustomers: (): Customer[] => JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]'),
  saveCustomers: (data: Customer[]) => localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data)),
  
  getExpenses: (): Expense[] => JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]'),
  saveExpenses: (data: Expense[]) => localStorage.setItem(KEYS.EXPENSES, JSON.stringify(data)),
};
