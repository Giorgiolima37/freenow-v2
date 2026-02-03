import React from 'react';
import { Sale } from '../types';

// Importação do Logo para o Cupom
import logoImg from '../logo.png';

interface Props {
  sale: Sale;
}

const ThermalReceipt: React.FC<Props> = ({ sale }) => {
  return (
    <div className="p-2 text-[12px] font-mono leading-tight bg-white text-black w-[58mm]">
      {/* Cabeçalho com Logo e Nome Real */}
      <div className="text-center mb-4">
        <img 
          src={logoImg} 
          alt="Logo" 
          className="w-32 mx-auto mb-2 grayscale" 
          style={{ filter: 'contrast(1.5) brightness(0.8)' }} 
        />
        <h2 className="text-lg font-bold uppercase">MERCADO MORRETES</h2>
        <p>Agradecemos a sua preferência</p>
        <p className="text-[10px]">CNPJ: 00.000.000/0001-00</p>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>
      
      <div className="flex justify-between text-[10px] mb-2">
        <span>Data: {new Date(sale.timestamp).toLocaleDateString()}</span>
        <span>Hora: {new Date(sale.timestamp).toLocaleTimeString()}</span>
      </div>
      <p className="text-[10px] mb-2">ID: {sale.id.slice(0, 8)}</p>

      <div className="border-t border-dashed border-black my-2"></div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-black">
            <th className="font-normal text-[10px]">ITEM</th>
            <th className="text-center font-normal text-[10px]">QTD</th>
            <th className="text-right font-normal text-[10px]">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 text-[10px]">{item.name.slice(0, 18)}</td>
              <td className="py-1 text-center text-[10px]">{item.quantity}</td>
              <td className="py-1 text-right text-[10px]">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black my-2"></div>

      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL:</span>
        <span>R$ {sale.total.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-[10px] mt-1">
        <span>FORMA PAGTO:</span>
        <span className="uppercase">{sale.paymentMethod}</span>
      </div>

      <div className="border-t border-dashed border-black my-4"></div>

      <div className="text-center italic">
        <p className="font-bold">Obrigado pela preferência!</p>
        <p>Volte sempre.</p>
      </div>
      
      <div className="mt-4 text-center text-[8px]">
        Mercado Morretes v1.0.0 Pro
      </div>
    </div>
  );
};

export default ThermalReceipt;