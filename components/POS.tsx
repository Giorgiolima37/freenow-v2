
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Trash2, CreditCard, Banknote, QrCode, UserPlus, Printer } from 'lucide-react';
import { Product, Sale, SaleItem, PaymentMethod, Customer } from '../types';

interface Props {
  products: Product[];
  onUpdateProducts: (data: Product[]) => void;
  sales: Sale[];
  onUpdateSales: (data: Sale[]) => void;
  customers: Customer[];
  onUpdateCustomers: (data: Customer[]) => void;
  onPrint: (sale: Sale) => void;
}

const POS: React.FC<Props> = ({ products, onUpdateProducts, sales, onUpdateSales, customers, onUpdateCustomers, onPrint }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const barcodeRef = useRef<HTMLInputElement>(null);

  const total = cart.reduce((acc, item) => acc + item.total, 0);

  // Focus barcode input automatically
  useEffect(() => {
    barcodeRef.current?.focus();
    const handleGlobalKeydown = () => barcodeRef.current?.focus();
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert('Estoque insuficiente!');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      if (product.stock <= 0) {
        alert('Produto sem estoque!');
        return;
      }
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.salePrice,
        total: product.salePrice
      }]);
    }
    setBarcodeInput('');
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
    } else {
      alert('Produto não encontrado!');
    }
    setBarcodeInput('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const finalizeSale = () => {
    if (cart.length === 0) return;
    if (paymentMethod === PaymentMethod.MONTHLY && !selectedCustomer) {
      alert('Selecione um cliente para venda fiada!');
      return;
    }

    const newSale: Sale = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      items: cart,
      total,
      paymentMethod,
      customerId: selectedCustomer || undefined
    };

    // Update Stock
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.productId === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });

    // Update Customer Debt if Monthly
    if (paymentMethod === PaymentMethod.MONTHLY && selectedCustomer) {
      const updatedCustomers = customers.map(c => 
        c.id === selectedCustomer ? { ...c, balance: c.balance + total } : c
      );
      onUpdateCustomers(updatedCustomers);
    }

    onUpdateProducts(updatedProducts);
    onUpdateSales([...sales, newSale]);
    onPrint(newSale);
    
    // Reset state
    setCart([]);
    setSelectedCustomer('');
    setPaymentMethod(PaymentMethod.CASH);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      {/* Left: Cart & Finalization */}
      <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold flex items-center">
              <ShoppingCart className="mr-2" size={20} /> Carrinho de Compras
            </h3>
            <span className="text-sm font-medium text-slate-500">{cart.length} itens</span>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingCart size={48} className="mb-2 opacity-20" />
                <p>O carrinho está vazio</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-400 uppercase">
                    <th className="pb-2">Produto</th>
                    <th className="pb-2 text-center">Quant.</th>
                    <th className="pb-2 text-right">Unit.</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cart.map(item => (
                    <tr key={item.productId}>
                      <td className="py-3 font-medium">{item.name}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-bold">R$ {item.total.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400">Total Geral</span>
              <span className="text-4xl font-black text-blue-400">R$ {total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={finalizeSale}
              disabled={cart.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center transition shadow-lg"
            >
              <Printer className="mr-2" /> FINALIZAR E IMPRIMIR (F2)
            </button>
          </div>
        </div>
      </div>

      {/* Right: Controls & Search */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleBarcodeSubmit} className="mb-6">
            <label className="block text-sm font-medium mb-2">Entrada de Código</label>
            <div className="relative">
              <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                ref={barcodeRef}
                type="text" 
                className="w-full pl-10 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 outline-none font-mono text-lg"
                placeholder="Passe o leitor ou digite..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />
            </div>
          </form>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: PaymentMethod.CASH, icon: Banknote, label: 'Dinheiro' },
                  { id: PaymentMethod.CREDIT_CARD, icon: CreditCard, label: 'Crédito' },
                  { id: PaymentMethod.DEBIT_CARD, icon: CreditCard, label: 'Débito' },
                  { id: PaymentMethod.PIX, icon: QrCode, label: 'PIX' },
                  { id: PaymentMethod.MONTHLY, icon: UserPlus, label: 'Fiado' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                  >
                    <method.icon size={20} className="mb-1" />
                    <span className="text-xs font-semibold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === PaymentMethod.MONTHLY && (
              <div>
                <label className="block text-sm font-medium mb-2">Vincular Cliente</label>
                <select 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">Selecione o Cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Débito: R$ {c.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Quick Search List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-64">
          <div className="p-3 bg-slate-50 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Pesquisar produto manual..." 
                className="w-full pl-7 pr-3 py-1 text-sm border rounded bg-white"
                onChange={(e) => {/* Implement quick filter if needed */}}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto divide-y">
            {products.slice(0, 10).map(p => (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                className="w-full p-3 flex justify-between items-center hover:bg-blue-50 transition text-left"
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-slate-500">Estoque: {p.stock} un</p>
                </div>
                <span className="text-sm font-bold text-blue-600">R$ {p.salePrice.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
