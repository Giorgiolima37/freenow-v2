
import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Package, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Product, Sale, Expense } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Props {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
}

const Dashboard: React.FC<Props> = ({ products, sales, expenses }) => {
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  
  const now = new Date();
  const nearExpiryCount = products.filter(p => {
    const expiry = new Date(p.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 7 && diffDays > 0;
  }).length;

  const totalSalesToday = sales
    .filter(s => new Date(s.timestamp).toDateString() === now.toDateString())
    .reduce((acc, s) => acc + s.total, 0);

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayString = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const amount = sales
      .filter(s => new Date(s.timestamp).toDateString() === date.toDateString())
      .reduce((acc, s) => acc + s.total, 0);
    return { name: dayString, total: amount };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resumo do Negócio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm">Vendas Hoje</p>
              <h3 className="text-2xl font-bold mt-1">R$ {totalSalesToday.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <ArrowUpRight size={14} className="mr-1" /> Crescimento de 12%
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm">Estoque Baixo</p>
              <h3 className="text-2xl font-bold mt-1">{lowStockCount}</h3>
            </div>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">Atenção aos itens críticos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm">Próximos do Vencimento</p>
              <h3 className="text-2xl font-bold mt-1">{nearExpiryCount}</h3>
            </div>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">Validade em até 7 dias</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm">Total de Produtos</p>
              <h3 className="text-2xl font-bold mt-1">{products.length}</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Cadastrados no sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold mb-6">Vendas dos Últimos 7 Dias</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#2563eb" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold mb-6">Categorias Populares</h3>
          <div className="space-y-4">
            {['Hortifruti', 'Laticínios', 'Limpeza', 'Padaria', 'Bebidas'].map((cat, i) => (
              <div key={cat} className="flex items-center">
                <span className="w-24 text-sm text-slate-500">{cat}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full mx-4">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${85 - i * 15}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{85 - i * 15}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
