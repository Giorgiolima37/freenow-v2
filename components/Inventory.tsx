import React, { useState } from 'react';
/* Added Package to imports */
import { Search, Plus, Edit, Trash2, Camera, Wand2, Package } from 'lucide-react';
import { Product } from '../types';
import ImageEditor from './ImageEditor';

interface Props {
  products: Product[];
  onUpdate: (data: Product[]) => void;
}

const Inventory: React.FC<Props> = ({ products, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeImageProduct, setActiveImageProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  // Ajustado para ser assíncrono e garantir a execução
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        // Atualização de produto existente
        const updatedList = products.map(p => p.id === editingProduct.id ? editingProduct as Product : p);
        await onUpdate(updatedList);
      } else {
        // Criação de novo produto
        // No arquivo Inventory.tsx, dentro da função handleSave:
const newProduct = {
  ...editingProduct,
  // Substitua crypto.randomUUID() por esta linha:
  id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  stock: Number(editingProduct.stock || 0),
  // ... restante do código
} as Product;
        
        await onUpdate([...products, newProduct]);
      }
      
      // Limpa o estado e fecha o modal apenas após o sucesso
      setEditingProduct(null);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao conectar com o banco de dados. Verifique sua conexão.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await onUpdate(products.filter(p => p.id !== id));
      } catch (error) {
        alert("Erro ao excluir o produto.");
      }
    }
  };

  const handleImageEdited = async (newUrl: string) => {
    if (activeImageProduct) {
      try {
        await onUpdate(products.map(p => p.id === activeImageProduct.id ? { ...p, imageUrl: newUrl } : p));
        setActiveImageProduct(null);
      } catch (error) {
        alert("Erro ao atualizar a imagem.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Gestão de Estoque</h2>
        <button 
          onClick={() => setEditingProduct({})}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" /> Novo Produto
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou código de barras..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-y border-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">Produto</th>
                <th className="px-4 py-3 font-medium text-slate-500">Categoria</th>
                <th className="px-4 py-3 font-medium text-slate-500">Estoque</th>
                <th className="px-4 py-3 font-medium text-slate-500">P. Venda</th>
                <th className="px-4 py-3 font-medium text-slate-500">Vencimento</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded mr-3 overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="text-slate-400" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.barcode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${p.stock <= (p.minStock || 0) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {p.stock} un
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">R$ {p.salePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setActiveImageProduct(p)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition"
                        title="Editar Imagem (IA)"
                      >
                        <Wand2 size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingProduct(p)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">{editingProduct.id ? 'Editar' : 'Novo'} Produto</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código de Barras</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.barcode || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, barcode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Hortifruti">Hortifruti</option>
                    <option value="Laticínios">Laticínios</option>
                    <option value="Padaria">Padaria</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Mercearia">Mercearia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço de Custo (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.purchasePrice || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, purchasePrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço de Venda (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, salePrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Inicial</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.stock || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alerta Estoque Mínimo</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.minStock || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, minStock: Number(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Validade</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.expiryDate || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Image Editor Modal */}
      {activeImageProduct && (
        <ImageEditor 
          product={activeImageProduct} 
          onSave={handleImageEdited} 
          onClose={() => setActiveImageProduct(null)} 
        />
      )}
    </div>
  );
};

export default Inventory;