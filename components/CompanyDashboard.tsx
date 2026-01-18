import React, { useEffect, useState } from 'react';
import { User, Job, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  worker_name: string;
  status: string;
  job_title?: string;
}

// Interface estendida para suportar campos extras da Empresa
interface ExtendedUser extends User {
  phone?: string;
  cpf?: string;
  description?: string;
}

interface CompanyDashboardProps {
  user: User;
  jobs: Job[];
  onLogout: () => void;
  onCreateJob: () => void;
  onViewDetails: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onJobUpdate?: () => void; 
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ 
  user, 
  jobs: initialJobs, 
  onLogout, 
  onCreateJob, 
  onViewDetails,
  onDeleteJob,
  onJobUpdate
}) => {
  // --- ESTADOS ---
  const [localJobs, setLocalJobs] = useState<Job[]>(initialJobs);
  const [applications, setApplications] = useState<Application[]>([]);
  const [counts, setCounts] = useState<{[key: string]: number}>({});
  
  // Estado para o Perfil do Candidato (Visualização)
  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedUser | null>(null);
  
  // Estados para o Perfil da Empresa (Edição)
  const [showCompanyBio, setShowCompanyBio] = useState(false);
  
  // --- ESTADO DO FORMULÁRIO DA EMPRESA (Atualizado com Município e Bairro) ---
  const [companyProfile, setCompanyProfile] = useState({
    businessName: user.businessName || '',
    address: user.address || '',
    municipio: user.municipio || '', // Novo
    bairro: user.bairro || '',       // Novo
    description: '' 
  });

  // --- EFEITOS ---
  useEffect(() => {
    setLocalJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    if (localJobs.length > 0) {
      fetchApplications();
      fetchApplicationCounts();
    }
  }, [localJobs]);

  // Carrega os dados da empresa ao iniciar
  useEffect(() => {
    fetchCompanyData();
  }, [user.id]);

  async function fetchCompanyData() {
    // Agora buscamos também municipio e bairro
    const { data } = await supabase
      .from('profiles')
      .select('business_name, address, description, municipio, bairro')
      .eq('id', user.id)
      .single();

    if (data) {
      setCompanyProfile({
        businessName: data.business_name || user.businessName || '',
        address: data.address || '',
        municipio: data.municipio || '', // Carrega do banco
        bairro: data.bairro || '',       // Carrega do banco
        description: data.description || ''
      });
    }
  }

  async function fetchApplications() {
    const companyJobIds = localJobs.map(j => j.id);
    if (companyJobIds.length === 0) return;

    const { data } = await supabase
      .from('applications')
      .select('*, jobs(role)')
      .in('job_id', companyJobIds)
      .eq('status', 'PENDING');

    if (data) {
      const formattedApps = data.map((app: any) => ({
        ...app,
        job_title: app.jobs?.role
      }));
      setApplications(formattedApps);
    } else {
      setApplications([]);
    }
  }

  async function fetchApplicationCounts() {
    const companyJobIds = localJobs.map(j => j.id);
    if (companyJobIds.length === 0) return;

    const { data } = await supabase
      .from('applications')
      .select('job_id')
      .in('job_id', companyJobIds);

    if (data) {
      const newCounts: {[key: string]: number} = {};
      data.forEach((app: any) => {
        newCounts[app.job_id] = (newCounts[app.job_id] || 0) + 1;
      });
      setCounts(newCounts);
    }
  }

  // --- SALVAR PERFIL DA EMPRESA (Atualizado) ---
  const handleSaveCompanyProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: companyProfile.businessName,
          address: companyProfile.address,
          municipio: companyProfile.municipio, // Salva municipio
          bairro: companyProfile.bairro,       // Salva bairro
          description: companyProfile.description
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Perfil da empresa atualizado com sucesso!');
      setShowCompanyBio(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar dados. Verifique se as colunas (municipio, bairro) existem no Supabase.');
    }
  };

  // --- CONTRATAR E DELETAR VAGA ---
  const handleHireCandidate = async (applicationId: string, workerName: string, jobId: string) => {
    const confirmHire = window.confirm(`Deseja contratar ${workerName}? A vaga será DELETADA do sistema.`);
    
    if (!confirmHire) return;

    setLocalJobs(current => current.filter(j => j.id !== jobId));
    setApplications(current => current.filter(app => app.id !== applicationId));

    try {
      const { error: appError } = await supabase.from('applications').delete().eq('job_id', jobId);
      if (appError) console.error("Erro clean apps", appError);

      const { error: jobError } = await supabase.from('jobs').delete().eq('id', jobId);
      if (jobError) throw jobError;

      alert(`Sucesso! ${workerName} contratado e vaga removida.`);
      if (onJobUpdate) onJobUpdate();

    } catch (error: any) {
      console.error('Erro no servidor:', error);
      alert('Atenção: A contratação foi registrada visualmente, mas houve um erro no servidor ao apagar a vaga.');
    }
  };

  // --- VER PERFIL DO CANDIDATO ---
  const handleViewProfile = async (workerId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', workerId).single();
      if (error) throw error;

      if (data) {
        setSelectedCandidate({
          id: data.id,
          name: data.name || 'Nome não informado',
          email: data.email || '',
          role: UserRole.WORKER,
          age: data.age,
          address: data.address,
          hasTransport: data.has_transport,
          photoUrl: data.photo_url,
          rating: data.rating || 0,
          phone: data.phone, 
          cpf: data.cpf,
          municipio: data.municipio,
          bairro: data.bairro
        });
      }
    } catch (err) {
      alert('Não foi possível carregar o perfil.');
    }
  };

  const handleRateUser = async (newRating: number) => {
    if (!selectedCandidate) return;
    setSelectedCandidate({ ...selectedCandidate, rating: newRating });
    try {
      await supabase.from('profiles').update({ rating: newRating }).eq('id', selectedCandidate.id);
    } catch (error) {
      console.error('Erro rating', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 relative">
      
      {/* --- HEADER --- */}
      <div className="bg-white px-6 py-6 border-b shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Painel da Empresa</h1>
              <p className="text-sm text-gray-500">{companyProfile.businessName || 'Gerencie suas vagas'}</p>
            </div>
            
            <button 
              onClick={() => setShowCompanyBio(true)}
              className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-100 transition border border-blue-100"
            >
              <i className="fa-solid fa-pen-to-square"></i> Bio
            </button>
          </div>

          <button onClick={onLogout} className="text-gray-400 hover:text-red-500">
            <i className="fa-solid fa-right-from-bracket text-lg"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 mt-6 overflow-y-auto pb-6">
        {/* Notificações / Candidaturas */}
        {applications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                {applications.length}
              </span>
              Candidaturas Recebidas
            </h2>
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 capitalize">{app.worker_name}</p>
                    <p className="text-sm text-gray-500">vaga: {app.job_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewProfile(app.worker_id)}
                      className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Ver Perfil
                    </button>
                    <button 
                      onClick={() => handleHireCandidate(app.id, app.worker_name, app.job_id)}
                      className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                    >
                      <i className="fa-solid fa-check"></i> Contratar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Suas Vagas</h2>
          <button onClick={onCreateJob} className="bg-gray-900 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700">
            <i className="fa-solid fa-plus text-sm"></i>
          </button>
        </div>

        {/* Lista de Vagas */}
        <div className="space-y-4">
          {localJobs.map(job => {
            const interessados = counts[job.id] || 0;
            const isClosed = job.status === 'Fechada' || job.status === 'Preenchida';
            
            return (
              <div 
                key={job.id} 
                onClick={() => onViewDetails(job)} 
                className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition relative group ${isClosed ? 'opacity-75 bg-gray-50' : 'border-gray-100'}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800">{job.role}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setLocalJobs(curr => curr.filter(j => j.id !== job.id));
                      onDeleteJob(job.id);
                    }}
                    className="text-gray-300 hover:text-red-500 transition p-2"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1 mb-3">
                  <i className="fa-regular fa-calendar mr-1"></i>
                  {new Date(job.date).toLocaleDateString('pt-BR')} • {job.startTime} às {job.endTime}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-green-600 font-bold">R$ {job.dailyRate.toFixed(2)}</span>
                  <div className="flex items-center">
                    {interessados > 0 && !isClosed && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-green-500 text-green-600 text-xs font-bold mr-2">
                        {interessados}
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${!isClosed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {localJobs.length === 0 && (
            <p className="text-gray-400 text-center py-10">Nenhuma vaga ativa.</p>
          )}
        </div>
      </div>

      {/* --- MODAL DE EDIÇÃO DA BIO DA EMPRESA (ATUALIZADO) --- */}
      {showCompanyBio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in relative overflow-hidden">
             <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Bio da Empresa</h3>
                <button onClick={() => setShowCompanyBio(false)} className="text-gray-400 hover:text-white">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
             </div>
             
             <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center text-gray-400">
                    <i className="fa-solid fa-building text-4xl"></i>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Nome da Empresa</label>
                    <input 
                      type="text" 
                      value={companyProfile.businessName}
                      onChange={(e) => setCompanyProfile({...companyProfile, businessName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* NOVO: GRID PARA MUNICÍPIO E BAIRRO */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Município</label>
                      <input 
                        type="text" 
                        value={companyProfile.municipio}
                        onChange={(e) => setCompanyProfile({...companyProfile, municipio: e.target.value})}
                        placeholder="Ex: Balneário"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Bairro</label>
                      <input 
                        type="text" 
                        value={companyProfile.bairro}
                        onChange={(e) => setCompanyProfile({...companyProfile, bairro: e.target.value})}
                        placeholder="Ex: Centro"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Endereço (Rua/Nº)</label>
                    <input 
                      type="text" 
                      value={companyProfile.address}
                      onChange={(e) => setCompanyProfile({...companyProfile, address: e.target.value})}
                      placeholder="Ex: Rua 123, Sala 1"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Sobre a Empresa</label>
                    <textarea 
                      rows={3}
                      value={companyProfile.description}
                      onChange={(e) => setCompanyProfile({...companyProfile, description: e.target.value})}
                      placeholder="Descreva sua empresa e o tipo de serviço que oferece..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveCompanyProfile}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-xl mt-6 hover:bg-green-700 transition shadow-lg shadow-green-100"
                >
                  Salvar Alterações
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL DO CANDIDATO (Mantido) --- */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedCandidate(null)} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 w-8 h-8 flex items-center justify-center z-10">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="p-6 flex flex-col items-center pt-10">
              <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-lg mb-3 overflow-hidden">
                {selectedCandidate.photoUrl ? (
                  <img src={selectedCandidate.photoUrl} alt="Candidato" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <i className="fa-solid fa-user text-4xl"></i>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1 capitalize">{selectedCandidate.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{selectedCandidate.email}</p>
              
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} onClick={() => handleRateUser(star)} className={`text-2xl cursor-pointer transition transform hover:scale-110 ${star <= (selectedCandidate.rating || 0) ? 'fa-solid fa-star text-yellow-400' : 'fa-regular fa-star text-gray-300'}`}></i>
                ))}
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3"><i className="fa-solid fa-cake-candles text-sm"></i></div>
                  <div><p className="text-xs text-gray-500">Idade</p><p className="font-semibold text-gray-800">{selectedCandidate.age ? `${selectedCandidate.age} anos` : 'Não informada'}</p></div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3"><i className="fa-solid fa-location-dot text-sm"></i></div>
                  <div><p className="text-xs text-gray-500">Mora em</p><p className="font-semibold text-gray-800 capitalize">{selectedCandidate.municipio ? `${selectedCandidate.municipio} - ${selectedCandidate.bairro}` : (selectedCandidate.address || 'Não informado')}</p></div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3"><i className="fa-brands fa-whatsapp text-sm"></i></div>
                   <div><p className="text-xs text-gray-500">Contato / WhatsApp</p><p className="font-semibold text-gray-800">{selectedCandidate.phone || 'Não informado'}</p></div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-3"><i className="fa-solid fa-id-card text-sm"></i></div>
                   <div><p className="text-xs text-gray-500">CPF</p><p className="font-semibold text-gray-800">{selectedCandidate.cpf || 'Não informado'}</p></div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3"><i className="fa-solid fa-car text-sm"></i></div>
                  <div><p className="text-xs text-gray-500">Transporte</p><p className="font-semibold text-gray-800">{selectedCandidate.hasTransport ? 'Possui veículo próprio' : 'Depende de transporte público'}</p></div>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="mt-6 w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;