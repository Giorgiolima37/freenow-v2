import React, { useState } from 'react';
import { User, Job, JobStatus } from '../types';
import { supabase } from '../lib/supabase'; // Importação do cliente supabase

interface CreateJobProps {
  user: User;
  onCancel: () => void;
  onCreate: (job: Job) => void;
}

const CreateJob: React.FC<CreateJobProps> = ({ user, onCancel, onCreate }) => {
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // --- NOVOS CAMPOS ADICIONADOS ---
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Objeto formatado para as colunas do seu banco Supabase
      const newJobData = {
        company_id: user.id,
        company_name: user.businessName || 'Empresa',
        role: role,
        date: date,
        start_time: startTime,
        end_time: endTime,
        daily_rate: parseFloat(dailyRate),
        description: description,
        status: 'OPEN',
        benefits: benefits.length > 0 ? benefits : [],
        // Enviando os novos campos
        city: city,
        neighborhood: neighborhood
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([newJobData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Mapeia de volta para o formato da interface Job do seu App
        const formattedJob: Job = {
          id: data.id,
          companyId: data.company_id,
          companyName: data.company_name,
          role: data.role,
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time,
          dailyRate: data.daily_rate,
          benefits: Array.isArray(data.benefits) ? data.benefits : [],
          description: data.description,
          status: data.status as JobStatus,
          // Se sua interface Job no types.ts tiver esses campos, eles serão passados
          // Caso contrário, apenas salvou no banco corretamente.
          city: data.city,
          neighborhood: data.neighborhood
        };
        
        onCreate(formattedJob);
      }
    } catch (error: any) {
      alert('Erro ao postar vaga: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 flex items-center border-b">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:text-green-600">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="ml-2 text-lg font-bold text-gray-800">Postar Vaga</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 pb-24">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo / Título</label>
          <input 
            type="text" 
            placeholder="Ex: Garçom, Atendente, Cozinheiro"
            required
            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
            <input 
              type="date" 
              required
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Diária (R$)</label>
            <input 
              type="number" 
              placeholder="0,00"
              required
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Início</label>
            <input 
              type="time" 
              required
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Término</label>
            <input 
              type="time" 
              required
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* --- UI PARA MUNICÍPIO E BAIRRO --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Município</label>
            <input 
              type="text" 
              placeholder="Ex: Florianópolis - SC"
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label>
            <input 
              type="text" 
              placeholder="Ex: Centro"
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Benefícios</label>
          <div className="flex gap-2 mb-2">
            <input 
              type="text" 
              placeholder="Ex: Alimentação no local"
              className="flex-1 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
            />
            <button 
              type="button"
              onClick={handleAddBenefit}
              className="bg-green-100 text-green-600 px-4 rounded-xl hover:bg-green-200"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {benefits.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {b}
                <button type="button" onClick={() => handleRemoveBenefit(i)} className="text-gray-400 hover:text-red-500">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição Livre</label>
          <textarea 
            rows={3}
            placeholder="Detalhes adicionais sobre o trabalho..."
            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-green-600'} text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition mt-4`}
        >
          {loading ? 'Postando...' : 'Postar Vaga'}
        </button>
      </form>
    </div>
  );
};

export default CreateJob;