
import React, { useState } from 'react';
import { DollarSign, ArrowUp, ArrowDown, Wallet, Calendar, Plus } from 'lucide-react';
import { Sale, Expense } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  onUpdateExpenses: (data: Expense[]) => void;
}

const Finance: React.FC<Props> = ({ sales, expenses, onUpdateExpenses }) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ date: new Date().toISOString().split('T')[0] });

  const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const profit = totalSales - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const expense = {
      ...newExpense,
      id: crypto.randomUUID(),
      amount: Number(newExpense.amount),
    } as Expense;
    onUpdateExpenses([...expenses, expense]);
    setShowExpenseForm(false);
    setNewExpense({ date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fluxo de Caixa</h2>
        <button 
          onClick={() => setShowExpenseForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition"
        >
          <Plus size={20} className="mr-2" /> Registrar Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-medium">Faturamento Total</span>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ArrowUp size={20} /></div>
          </div>
          <p className="text-3xl font-black text-slate-900">R$ {totalSales.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-medium">Despesas Totais</span>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ArrowDown size={20} /></div>
          </div>
          <p className="text-3xl font-black text-slate-900">R$ {totalExpenses.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Lucro Líquido</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Wallet size={20} /></div>
          </div>
          <p className="text-3xl font-black text-white">R$ {profit.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold flex items-center"><Calendar size={18} className="mr-2" /> Últimas Vendas</h3>
          </div>
          <div className="p-4 overflow-auto max-h-[400px]">
            <table className="w-full">
              <thead className="text-xs text-slate-400 border-b">
                <tr>
                  <th className="pb-2 text-left">Data</th>
                  <th className="pb-2 text-left">Método</th>
                  <th className="pb-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.slice(-10).reverse().map(sale => (
                  <tr key={sale.id} className="text-sm">
                    <td className="py-3">{new Date(sale.timestamp).toLocaleDateString()}</td>
                    <td className="py-3">{sale.paymentMethod}</td>
                    <td className="py-3 text-right font-bold text-green-600">R$ {sale.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold flex items-center"><ArrowDown size={18} className="mr-2" /> Últimas Despesas</h3>
          </div>
          <div className="p-4 overflow-auto max-h-[400px]">
            <table className="w-full">
              <thead className="text-xs text-slate-400 border-b">
                <tr>
                  <th className="pb-2 text-left">Data</th>
                  <th className="pb-2 text-left">Descrição</th>
                  <th className="pb-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.slice(-10).reverse().map(exp => (
                  <tr key={exp.id} className="text-sm">
                    <td className="py-3">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="py-3">{exp.description}</td>
                    <td className="py-3 text-right font-bold text-red-600">R$ {exp.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between">
              <h3 className="text-xl font-bold">Nova Despesa</h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-slate-400"><Calendar size={20} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input required className="w-full px-3 py-2 border rounded-lg" value={newExpense.description || ''} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                <input type="number" step="0.01" required className="w-full px-3 py-2 border rounded-lg" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select required className="w-full px-3 py-2 border rounded-lg" value={newExpense.category || ''} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                  <option value="">Selecione...</option>
                  <option value="Fornecedor">Fornecedor</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Salários">Salários</option>
                  <option value="Energia/Água">Energia / Água</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Manutenção">Manutenção</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input type="date" required className="w-full px-3 py-2 border rounded-lg" value={newExpense.date || ''} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
              </div>
              <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold">Registrar Saída</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
