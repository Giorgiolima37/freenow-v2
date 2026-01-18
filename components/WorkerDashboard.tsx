import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Job } from '../types';

interface WorkerDashboardProps {
  user: User;
  jobs: Job[];
  onLogout: () => void;
  onViewDetails: (job: Job) => void;
  onOpenProfile: () => void;
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user, jobs, onLogout, onOpenProfile }) => {
  const [filter, setFilter] = useState('');
  const [companyDescriptions, setCompanyDescriptions] = useState<{[key: string]: string}>({});
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  
  // Controle do Modal de Detalhes e da Confirmação
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function fetchDescriptions() {
      const userIds = [...new Set(jobs.map(job => (job as any).user_id || job.companyId).filter(Boolean))];
      if (userIds.length === 0) return;

      try {
        const { data } = await supabase.from('profiles').select('id, description').in('id', userIds);
        if (data) {
          const descMap: {[key: string]: string} = {};
          data.forEach((profile: any) => {
            if (profile.description) descMap[profile.id] = profile.description;
          });
          setCompanyDescriptions(descMap);
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchUserApplications() {
      try {
        const { data } = await supabase
          .from('applications')
          .select('job_id')
          .eq('worker_id', user.id);
        
        if (data) {
          setAppliedJobIds(data.map(app => app.job_id));
        }
      } catch (err) {
        console.error('Erro ao buscar candidaturas:', err);
      }
    }

    if (jobs.length > 0) {
      fetchDescriptions();
      fetchUserApplications();
    }
  }, [jobs, user.id]);

  // Ao abrir detalhes, sempre reseta a confirmação
  const handleOpenDetails = (job: Job) => {
    setSelectedJob(job);
    setShowConfirm(false);
  };

  const handleApply = async (job: Job) => {
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          worker_id: user.id,
          worker_name: user.name,
          status: 'PENDING'
        });

      if (error) {
        if (error.code === '23505') { 
          alert('Você já se candidatou para esta vaga.');
        } else {
          throw error;
        }
      } else {
        alert('Sucesso! A empresa foi notificada da sua candidatura.');
        setAppliedJobIds([...appliedJobIds, job.id]);
        setSelectedJob(null);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao se candidatar. Tente novamente.');
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.role.toLowerCase().includes(filter.toLowerCase()) || 
    job.companyName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Olá, {user.name.split(' ')[0]}!</h1>
            <p className="text-sm text-gray-500">Encontre sua diária de hoje.</p>
          </div>
          
          <div className="flex gap-2 items-center">
            <button 
              onClick={onOpenProfile}
              className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition flex items-center gap-2 border border-blue-100"
            >
              <i className="fa-regular fa-id-card"></i> Bio
            </button>
            <button onClick={onLogout} className="text-gray-400 hover:text-red-500 px-2">
              <i className="fa-solid fa-right-from-bracket text-lg"></i>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Buscar por cargo ou empresa..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-green-500 outline-none text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex-1 px-6 mt-6 overflow-y-auto pb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Vagas Disponíveis</h2>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {filteredJobs.length} encontradas
          </span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300 mt-4">
            <i className="fa-solid fa-search text-gray-300 text-4xl mb-3"></i>
            <p className="text-gray-500">Nenhuma vaga disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => {
              // Tenta pegar descrição pelo ID do usuario dono da vaga
              const description = companyDescriptions[(job as any).user_id || job.companyId];
              const isApplied = appliedJobIds.includes(job.id);

              return (
                <div 
                  key={job.id} 
                  onClick={() => handleOpenDetails(job)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer active:scale-95"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 text-lg">Free para {job.role}</h3>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-green-600 font-bold">R$ {job.dailyRate.toFixed(2)}</span>
                      {isApplied && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1">
                          Candidatado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* --- BLOCO DA EMPRESA E LOCALIZAÇÃO --- */}
                  <div className="mb-3">
                     <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-store text-gray-400 text-xs"></i> {job.companyName}
                     </p>
                     
                     {/* Localização adicionada aqui */}
                     <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-red-400"></i>
                        <span className="capitalize">
                          {(job as any).city || 'Município não inf.'} - {(job as any).neighborhood || 'Bairro não inf.'}
                        </span>
                     </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.benefits.slice(0, 2).map((b, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {b}
                      </span>
                    ))}
                    {job.benefits.length > 2 && <span className="text-[10px] text-gray-400">+{job.benefits.length - 2}</span>}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-xs text-gray-400 mb-2">
                    <span>
                      <i className="fa-regular fa-clock mr-1"></i> {job.startTime} - {job.endTime}
                    </span>
                    <span>
                      <i className="fa-regular fa-calendar mr-1"></i> {new Date(job.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {description && (
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                      <p className="text-[10px] text-gray-500 italic leading-relaxed line-clamp-1">
                         "{description}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL DE DETALHES --- */}
      {selectedJob && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in overflow-y-auto">
          {/* Header do Modal */}
          <div className="bg-white px-6 py-4 border-b flex items-center sticky top-0 z-10">
            <button 
              onClick={() => setSelectedJob(null)}
              className="text-gray-500 hover:text-gray-800 mr-4"
            >
              <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>
            <h2 className="text-lg font-bold text-gray-800">Detalhes da Vaga</h2>
          </div>

          <div className="p-6 max-w-lg mx-auto w-full flex-1 flex flex-col justify-between">
             <div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                  DIÁRIA DISPONÍVEL
                </span>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">Free para {selectedJob.role}</h1>
                <p className="text-gray-500 font-medium mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-shop text-gray-400"></i> {selectedJob.companyName}
                </p>

                {/* --- GRID DE PAGAMENTO E DATA --- */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Pagamento</p>
                      <p className="text-green-600 text-xl font-bold">R$ {selectedJob.dailyRate.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Data</p>
                      <p className="text-gray-800 text-xl font-bold">{new Date(selectedJob.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>

                {/* --- GRID DE LOCALIZAÇÃO --- */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Município</p>
                      <p className="text-gray-800 font-bold capitalize">{(selectedJob as any).city || 'Não informado'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Bairro</p>
                      <p className="text-gray-800 font-bold capitalize">{(selectedJob as any).neighborhood || 'Não informado'}</p>
                    </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">Horário</p>
                  <p className="text-gray-700 flex items-center gap-2">
                    <i className="fa-regular fa-clock text-green-500"></i> {selectedJob.startTime} às {selectedJob.endTime}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">Benefícios</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((b, i) => (
                      <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                        <i className="fa-solid fa-check text-xs"></i> {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Descrição no Modal */}
                {companyDescriptions[(selectedJob as any).user_id || selectedJob.companyId] && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                      Sobre a Empresa
                    </p>
                    <p className="text-sm text-gray-600 italic leading-relaxed">
                      "{companyDescriptions[(selectedJob as any).user_id || selectedJob.companyId]}"
                    </p>
                  </div>
                )}
             </div>

             {/* --- ÁREA DE BOTÕES --- */}
             <div className="mt-6 pt-4 border-t border-gray-100 pb-6">
               {appliedJobIds.includes(selectedJob.id) ? (
                 <button 
                   disabled
                   className="w-full bg-gray-200 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed text-lg"
                 >
                   Já Candidatado
                 </button>
               ) : showConfirm ? (
                 // MODO DE CONFIRMAÇÃO
                 <div className="flex gap-4 animate-fade-in">
                    <button 
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition text-lg"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => handleApply(selectedJob)}
                      className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 text-lg"
                    >
                      Confirmar
                    </button>
                 </div>
               ) : (
                 // BOTÃO PADRÃO
                 <button 
                   onClick={() => setShowConfirm(true)}
                   className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 text-lg"
                 >
                   Aceitar Vaga
                 </button>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;