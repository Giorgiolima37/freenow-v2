
import React from 'react';
import { Sale } from '../types';

interface Props {
  sale: Sale;
}

const ThermalReceipt: React.FC<Props> = ({ sale }) => {
  return (
    <div className="p-2 text-[12px] font-mono leading-tight bg-white text-black w-[58mm]">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">MERCADOFÁCIL PRO</h2>
        <p>Rua do Comércio, 123 - Centro</p>
        <p>(11) 98888-7777</p>
        <p>CNPJ: 00.000.000/0001-00</p>
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
            <th className="font-normal">ITEM</th>
            <th className="text-center font-normal">QTD</th>
            <th className="text-right font-normal">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1">{item.name.slice(0, 15)}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right">{item.total.toFixed(2)}</td>
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
        <span>{sale.paymentMethod}</span>
      </div>

      <div className="border-t border-dashed border-black my-4"></div>

      <div className="text-center italic">
        <p>Obrigado pela preferência!</p>
        <p>Volte sempre.</p>
      </div>
      
      <div className="mt-4 text-center text-[8px]">
        MercadoFácil Pro v1.0
      </div>
    </div>
  );
};

export default ThermalReceipt;
