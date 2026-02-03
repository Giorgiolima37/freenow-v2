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
    
    // Mapeia os nomes do banco de volta para o formato do seu código (Frontend)
    return (data || []).map(p => ({
      ...p,
      salePrice: p.price,
      expiryDate: p.expiration_date,
      stock: p.stock_quantity
    })) as Product[];
  },

  saveProducts: async (products: Product[]) => {
    // Mapeia o formato do código para as colunas reais da sua tabela no Supabase
    const productsToSave = products.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.salePrice),
      category: p.category,
      stock_quantity: Number(p.stock),
      expiration_date: p.expiryDate
    }));

    const { error } = await supabase
      .from('products')
      .upsert(productsToSave);

    if (error) {
      console.error('Erro ao salvar produtos no Supabase:', error.message);
      throw error;
    }
  },

  // --- VENDAS ---
  getSales: async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) return [];
    return data as Sale[];
  },

  saveSales: async (sales: Sale[]) => {
    const { error } = await supabase
      .from('sales')
      .upsert(sales);

    if (error) {
      console.error('Erro ao salvar vendas:', error.message);
      throw error;
    }
  },

  // --- CLIENTES E DESPESAS (MANTIDOS) ---
  getCustomers: async () => {
    const { data } = await supabase.from('customers').select('*');
    return data || [];
  },

  saveCustomers: async (customers: Customer[]) => {
    await supabase.from('customers').upsert(customers);
  },

  getExpenses: async () => {
    const { data } = await supabase.from('expenses').select('*');
    return data || [];
  },

  saveExpenses: async (expenses: Expense[]) => {
    await supabase.from('expenses').upsert(expenses);
  }
};