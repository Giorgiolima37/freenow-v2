
import React from 'react';
import { Clock, AlertTriangle, CheckCircle, Trash2, Tag } from 'lucide-react';
import { Product } from '../types';

interface Props {
  products: Product[];
  onUpdate: (data: Product[]) => void;
}

const Expiration: React.FC<Props> = ({ products, onUpdate }) => {
  const now = new Date();
  
  const getExpiryStatus = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-700', icon: Trash2 };
    if (diffDays <= 7) return { label: 'Vence em ' + diffDays + ' dias', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle };
    return { label: 'Regular', color: 'bg-green-100 text-green-700', icon: CheckCircle };
  };

  const expired = products.filter(p => new Date(p.expiryDate) < now);
  const nearExpiry = products.filter(p => {
    const expiry = new Date(p.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const handleDiscount = (id: string) => {
    const discount = prompt('Informe a nova porcentagem de desconto (ex: 30 para 30%):', '50');
    if (discount && !isNaN(Number(discount))) {
      onUpdate(products.map(p => {
        if (p.id === id) {
          const factor = (100 - Number(discount)) / 100;
          return { ...p, salePrice: p.salePrice * factor };
        }
        return p;
      }));
    }
  };

  const handleRemove = (id: string) => {
    if (confirm('Deseja remover este item vencido do sistema?')) {
      onUpdate(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Controle de Validade</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-red-200">
          <div className="p-4 border-b border-red-100 flex items-center bg-red-50 rounded-t-xl">
            <Trash2 className="text-red-600 mr-2" />
            <h3 className="font-bold text-red-800">Produtos Vencidos</h3>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-auto">
            {expired.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 border border-red-100 rounded-lg">
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs text-slate-500">Vencimento: {new Date(p.expiryDate).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleRemove(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            ))}
            {expired.length === 0 && <p className="text-center py-4 text-slate-400 italic">Nenhum produto vencido.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-amber-200">
          <div className="p-4 border-b border-amber-100 flex items-center bg-amber-50 rounded-t-xl">
            <Clock className="text-amber-600 mr-2" />
            <h3 className="font-bold text-amber-800">Vencendo nos Próximos 7 Dias</h3>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-auto">
            {nearExpiry.map(p => {
              const status = getExpiryStatus(p.expiryDate);
              return (
                <div key={p.id} className="flex justify-between items-center p-3 border border-amber-100 rounded-lg">
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <button onClick={() => handleDiscount(p.id)} className="flex items-center space-x-1 p-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition text-xs font-bold">
                    <Tag size={14} /> <span>Liquidação</span>
                  </button>
                </div>
              );
            })}
            {nearExpiry.length === 0 && <p className="text-center py-4 text-slate-400 italic">Nenhum produto vencendo em breve.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expiration;
