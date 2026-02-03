
import React, { useState } from 'react';
import { Users, Search, Plus, Phone, MapPin, DollarSign, History } from 'lucide-react';
import { Customer, Sale } from '../types';

interface Props {
  customers: Customer[];
  sales: Sale[];
  onUpdate: (data: Customer[]) => void;
}

const Customers: React.FC<Props> = ({ customers, sales, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [selectedHistory, setSelectedHistory] = useState<Customer | null>(null);

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      balance: formData.balance || 0,
    } as Customer;

    if (formData.id) {
      onUpdate(customers.map(c => c.id === formData.id ? newCustomer : c));
    } else {
      onUpdate([...customers, newCustomer]);
    }
    setShowForm(false);
    setFormData({});
  };

  const handlePayBalance = (id: string, amount: number) => {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    const payment = prompt(`O cliente ${customer.name} deve R$ ${customer.balance.toFixed(2)}. Quanto deseja abater?`, customer.balance.toString());
    if (payment && !isNaN(Number(payment))) {
      const value = Number(payment);
      onUpdate(customers.map(c => c.id === id ? { ...c, balance: Math.max(0, c.balance - value) } : c));
    }
  };

  const customerSales = selectedHistory ? sales.filter(s => s.customerId === selectedHistory.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" /> Novo Cliente
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="p-4 border rounded-xl hover:border-blue-200 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {c.name.charAt(0)}
                </div>
                {c.balance > 0 && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">EM DÉBITO</span>
                )}
              </div>
              <h3 className="font-bold text-lg">{c.name}</h3>
              <div className="mt-2 space-y-1 text-sm text-slate-500">
                <p className="flex items-center"><Phone size={14} className="mr-2" /> {c.phone}</p>
                <p className="flex items-center"><MapPin size={14} className="mr-2" /> {c.address}</p>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Saldo Devedor</p>
                  <p className={`font-bold ${c.balance > 0 ? 'text-red-600' : 'text-slate-600'}`}>R$ {c.balance.toFixed(2)}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedHistory(c)}
                    className="p-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition"
                    title="Histórico"
                  >
                    <History size={18} />
                  </button>
                  <button 
                    onClick={() => handlePayBalance(c.id, c.balance)}
                    className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition"
                    title="Receber Pagamento"
                  >
                    <DollarSign size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forms & Modals */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between">
              <h3 className="text-xl font-bold">Cadastro de Cliente</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo</label>
                <input required className="w-full px-3 py-2 border rounded-lg" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone / WhatsApp</label>
                <input required className="w-full px-3 py-2 border rounded-lg" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Endereço</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Salvar Cliente</button>
            </form>
          </div>
        </div>
      )}

      {selectedHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b flex justify-between">
              <div>
                <h3 className="text-xl font-bold">Histórico de Vendas</h3>
                <p className="text-sm text-slate-500">{selectedHistory.name}</p>
              </div>
              <button onClick={() => setSelectedHistory(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-400 uppercase border-b">
                  <tr>
                    <th className="pb-2">Data</th>
                    <th className="pb-2">Produtos</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customerSales.map(sale => (
                    <tr key={sale.id} className="text-sm">
                      <td className="py-3">{new Date(sale.timestamp).toLocaleString('pt-BR')}</td>
                      <td className="py-3">{sale.items.length} itens</td>
                      <td className="py-3 text-right font-bold">R$ {sale.total.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">REGISTRADA</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customerSales.length === 0 && <p className="text-center py-8 text-slate-400">Nenhuma venda vinculada.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Icon components not defined earlier
const X: React.FC<{ size?: number }> = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

export default Customers;
