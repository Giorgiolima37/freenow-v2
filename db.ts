import { Product, Sale, Customer, Expense } from './types';
import { supabase } from './supabaseClient';

export const db = {
  // --- PRODUTOS ---
  getProducts: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar produtos:', error.message);
      return [];
    }
    return data as Product[];
  },

  saveProducts: async (products: Product[]) => {
    // No Supabase, o ideal é salvar item por item ou usar o upsert
    const { error } = await supabase
      .from('products')
      .upsert(products);

    if (error) console.error('Erro ao salvar produtos:', error.message);
  },

  // --- VENDAS ---
  getSales: async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erro ao buscar vendas:', error.message);
      return [];
    }
    return data as Sale[];
  },

  saveSales: async (sales: Sale[]) => {
    // Salva/Atualiza a lista de vendas
    const { error } = await supabase
      .from('sales')
      .upsert(sales);

    if (error) console.error('Erro ao salvar vendas:', error.message);
  },

  // --- CLIENTES ---
  getCustomers: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    
    if (error) return [];
    return data as Customer[];
  },

  saveCustomers: async (customers: Customer[]) => {
    await supabase.from('customers').upsert(customers);
  },

  // --- DESPESAS ---
  getExpenses: async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*');
    
    if (error) return [];
    return data as Expense[];
  },

  saveExpenses: async (expenses: Expense[]) => {
    await supabase.from('expenses').upsert(expenses);
  }
};