import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  FileText,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { AppView, Product, Sale, Customer, Expense } from './types';
import { db } from './db';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Customers from './components/Customers';
import Finance from './components/Finance';
import Reports from './components/Reports';
import Expiration from './components/Expiration';
import ThermalReceipt from './components/ThermalReceipt';

// Importação do Logo
import logoImg from './logo.png';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load Data
  useEffect(() => {
    setProducts(db.getProducts());
    setSales(db.getSales());
    setCustomers(db.getCustomers());
    setExpenses(db.getExpenses());
  }, []);

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    db.saveProducts(newProducts);
  };

  const updateSales = (newSales: Sale[]) => {
    setSales(newSales);
    db.saveSales(newSales);
  };

  const updateCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    db.saveCustomers(newCustomers);
  };

  const updateExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    db.saveExpenses(newExpenses);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'pos', label: 'PDV / Vendas', icon: ShoppingCart },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'expiration', label: 'Validade', icon: Clock },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ];

  const handlePrint = (sale: Sale) => {
    setLastSale(sale);
    // Timeout to ensure DOM is updated before print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 text-slate-600 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Header da Sidebar com altura aumentada para o logo grande */}
        <div className="p-2 flex flex-col items-center justify-center border-b border-slate-100 min-h-[140px] relative">
          {isSidebarOpen ? (
            <div className="w-full px-2 flex justify-center">
              <img 
                src={logoImg} 
                alt="Mercado Morretes" 
                className="h-28 w-auto object-contain transition-all duration-300 transform scale-110" 
              />
            </div>
          ) : (
            <div className="h-10" /> // Espaçador quando fechado
          )}
          
          {/* Botão de fechar/abrir posicionado para não atrapalhar o logo */}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="absolute top-2 right-2 p-1 hover:bg-slate-100 rounded text-slate-400"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center p-4 transition-colors ${
                view === item.id 
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <item.icon size={22} className={isSidebarOpen ? 'mr-4' : 'mx-auto'} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <p className={`text-xs text-slate-400 font-semibold ${isSidebarOpen ? '' : 'text-center'}`}>v1.0.0 Pro</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {view === 'dashboard' && <Dashboard products={products} sales={sales} expenses={expenses} />}
          {view === 'inventory' && <Inventory products={products} onUpdate={updateProducts} />}
          {view === 'pos' && (
            <POS 
              products={products} 
              onUpdateProducts={updateProducts}
              sales={sales}
              onUpdateSales={updateSales}
              customers={customers}
              onUpdateCustomers={updateCustomers}
              onPrint={handlePrint}
            />
          )}
          {view === 'customers' && <Customers customers={customers} sales={sales} onUpdate={updateCustomers} />}
          {view === 'finance' && <Finance sales={sales} expenses={expenses} onUpdate={updateExpenses} />}
          {view === 'reports' && <Reports products={products} sales={sales} expenses={expenses} customers={customers} />}
          {view === 'expiration' && <Expiration products={products} onUpdate={updateProducts} />}
        </div>
      </main>

      {/* Thermal Receipt Hidden Portal */}
      <div id="thermal-receipt" className="hidden print:block">
        {lastSale && <ThermalReceipt sale={lastSale} />}
      </div>
    </div>
  );
};

export default App;