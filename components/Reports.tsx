
import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { Product, Sale, Expense, Customer } from '../types';

interface Props {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
}

const Reports: React.FC<Props> = ({ products, sales, expenses, customers }) => {
  const reportCards = [
    { title: 'Inventário Geral', icon: FileText, desc: 'Lista de todos os produtos, quantidades e valores em estoque.' },
    { title: 'Fechamento Mensal', icon: FileText, desc: 'Resumo de vendas, despesas e lucro do mês atual.' },
    { title: 'Relatório de Fiados', icon: FileText, desc: 'Lista de clientes com saldo devedor pendente.' },
    { title: 'Produtos Mais Vendidos', icon: FileText, desc: 'Análise de performance por volume de saída.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios e Consultas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors group">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <report.icon size={24} />
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition"><Download size={20} /></button>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition"><Printer size={20} /></button>
              </div>
            </div>
            <h3 className="mt-4 font-bold text-lg">{report.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{report.desc}</p>
            <button className="mt-6 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition">
              Gerar Relatório
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Análise de IA (Próxima Versão)</h3>
          <p className="max-w-md opacity-80">Estamos preparando uma ferramenta de IA para prever a falta de estoque e sugerir pedidos automáticos baseados no histórico de vendas.</p>
        </div>
        <div className="absolute right-[-50px] top-[-50px] opacity-10">
          <FileText size={300} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
