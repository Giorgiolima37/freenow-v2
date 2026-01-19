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
  worker_photo?: string;
}

interface ExtendedUser extends User {
  phone?: string;
  cpf?: string;
  description?: string;
  rating?: number; 
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
  
  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedUser | null>(null);
  const [showCompanyBio, setShowCompanyBio] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- ESTADOS PARA O SISTEMA DE AVALIAÇÃO ---
  const [editingRating, setEditingRating] = useState<number>(1);
  const [isSavingRating, setIsSavingRating] = useState(false);
  
  // Novos estados para controlar a exclusão automática após avaliação
  const [currentReviewJobId, setCurrentReviewJobId] = useState<string | null>(null);
  const [hasRatedSession, setHasRatedSession] = useState(false);

  const [companyProfile, setCompanyProfile] = useState({
    businessName: user.businessName || '',
    cnpj: '', 
    address: user.address || '',
    municipio: user.municipio || '', 
    bairro: user.bairro || '',       
    description: '' 
  });

  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatCnpj = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-'); 
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`; 
  };

  const formatPhone = (value: string | undefined) => {
    if (!value) return 'Não informado';
    return value
      .replace(/\D/g, '') 
      .replace(/(\d{2})(\d)/, '($1) $2') 
      .replace(/(\d{5})(\d)/, '$1-$2') 
      .replace(/(-\d{4})\d+?$/, '$1'); 
  };

  useEffect(() => {
    setLocalJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    if (localJobs.length > 0) {
      fetchApplications();
      fetchApplicationCounts();
    }
  }, [localJobs]);

  useEffect(() => {
    fetchCompanyData();
  }, [user.id]);

  useEffect(() => {
    if (showCompanyBio) {
      setIsEditing(false); 
    }
  }, [showCompanyBio]);

  async function fetchCompanyData() {
    const { data } = await supabase
      .from('profiles')
      .select('business_name, cnpj, address, description, municipio, bairro')
      .eq('id', user.id)
      .single();

    if (data) {
      setCompanyProfile({
        businessName: data.business_name || user.businessName || '',
        cnpj: data.cnpj || '', 
        address: data.address || '',
        municipio: data.municipio || '', 
        bairro: data.bairro || '',       
        description: data.description || ''
      });
    }
  }

  async function fetchApplications() {
    const companyJobIds = localJobs.map(j => j.id);
    if (companyJobIds.length === 0) return;

    const { data: appsData } = await supabase
      .from('applications')
      .select('*, jobs(role)')
      .in('job_id', companyJobIds)
      .in('status', ['PENDING', 'HIRED']);

    if (appsData && appsData.length > 0) {
      const workerIds = appsData.map((app: any) => app.worker_id);
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, photo_url')
        .in('id', workerIds);

      let formattedApps = appsData.map((app: any) => {
        const profile = profilesData?.find((p: any) => p.id === app.worker_id);
        return {
          ...app,
          job_title: app.jobs?.role,
          worker_photo: profile?.photo_url
        };
      });

      // --- FILTRO: Se tem alguém HIRED, esconde os PENDING dessa vaga ---
      const jobsWithHires = new Set(
        formattedApps
          .filter((app: any) => app.status === 'HIRED')
          .map((app: any) => app.job_id)
      );

      formattedApps = formattedApps.filter((app: any) => {
        if (jobsWithHires.has(app.job_id)) {
           return app.status === 'HIRED';
        }
        return true;
      });

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

  const handleSaveCompanyProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: companyProfile.businessName,
          cnpj: companyProfile.cnpj, 
          address: companyProfile.address,
          municipio: companyProfile.municipio, 
          bairro: companyProfile.bairro,       
          description: companyProfile.description
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Perfil da empresa atualizado com sucesso!');
      setIsEditing(false); 
      setShowCompanyBio(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar dados.');
    }
  };

  const handleTerminateJob = async (jobId: string) => {
    try {
      await supabase.from('applications').delete().eq('job_id', jobId);
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;

      setLocalJobs(curr => curr.filter(j => j.id !== jobId));
      onDeleteJob(jobId);
      setSelectedJob(null);
    } catch (error: any) {
      console.error('Erro ao encerrar vaga: ' + error.message);
    }
  };

  useEffect(() => {
    const cleanExpiredJobs = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      for (const job of localJobs) {
        // Se estiver FILLED (finalizada manualmente), não deleta por data ainda, pois precisa de avaliação
        if (job.status === 'FILLED') continue;

        const jobDateParts = job.date.split('-');
        const jobDate = new Date(
          Number(jobDateParts[0]), 
          Number(jobDateParts[1]) - 1, 
          Number(jobDateParts[2])
        );

        const expiryDate = new Date(jobDate);
        expiryDate.setDate(expiryDate.getDate() + 1);

        if (today >= expiryDate) {
          await handleTerminateJob(job.id);
        }
      }
    };

    if (localJobs.length > 0) {
      cleanExpiredJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localJobs]); 

  const handleOpenJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDeleteConfirm(false);
  };

  const handleHireCandidate = async (applicationId: string, workerName: string, jobId: string) => {
    const confirmHire = window.confirm(`Deseja contratar ${workerName}? A vaga será marcada como Finalizada e os outros candidatos serão dispensados.`);
    
    if (!confirmHire) return;

    try {
      // 1. Marca Candidato como HIRED
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'HIRED' })
        .eq('id', applicationId);
      
      if (appError) throw appError;

      // 2. Marca Vaga como FILLED
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: 'FILLED' })
        .eq('id', jobId);

      if (jobError) throw jobError;

      alert(`Sucesso! ${workerName} contratado.`);

      // 3. Atualizações Visuais
      setLocalJobs(current => current.map(job => 
        job.id === jobId ? { ...job, status: 'FILLED' } : job
      ));
      
      setApplications(current => current.filter(app => {
         if (app.job_id === jobId) {
             return app.id === applicationId; 
         }
         return true;
      }).map(app => 
         app.id === applicationId ? { ...app, status: 'HIRED' } : app
      ));

      if (onJobUpdate) onJobUpdate();

    } catch (error: any) {
      console.error('Erro no servidor:', error);
      alert('Erro ao realizar contratação: ' + error.message);
    }
  };

  // --- ALTERAÇÃO NO VIEW PROFILE PARA RECEBER O JOB ID ---
  const handleViewProfile = async (workerId: string, workerNameFromApp?: string, jobId?: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', workerId).single();
      if (error) throw error;
      if (data) {
        const initialRating = (data.rating === 0 || data.rating === null) ? 1 : data.rating;

        setSelectedCandidate({
          id: data.id,
          name: data.name || workerNameFromApp || 'Nome não informado',
          email: data.email || '',
          role: UserRole.WORKER,
          age: data.age,
          address: data.address,
          hasTransport: data.has_transport,
          photoUrl: data.photo_url,
          rating: initialRating, 
          phone: data.phone, 
          cpf: data.cpf,
          municipio: data.municipio,
          bairro: data.bairro
        });
        setEditingRating(initialRating);
        
        // Armazena qual vaga estamos avaliando
        if (jobId) {
            setCurrentReviewJobId(jobId);
        }
        setHasRatedSession(false); // Reseta o estado de "já avaliou nesta sessão"
      }
    } catch (err) {
      alert('Não foi possível carregar o perfil.');
    }
  };

  const handleSaveRating = async () => {
    if (!selectedCandidate) return;
    setIsSavingRating(true);
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ rating: editingRating })
            .eq('id', selectedCandidate.id);

        if (error) throw error;

        setSelectedCandidate(prev => prev ? { ...prev, rating: editingRating } : null);
        setHasRatedSession(true); // MARCA QUE SALVOU A NOTA
        alert('Avaliação salva com sucesso! Ao fechar, a vaga será concluída.');
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        alert('Erro ao salvar a avaliação.');
    } finally {
        setIsSavingRating(false);
    }
  };

  // --- NOVA FUNÇÃO PARA FECHAR O MODAL ---
  const handleCloseProfileModal = async () => {
    // Se o usuário salvou a nota E temos o ID da vaga associada
    if (hasRatedSession && currentReviewJobId) {
        try {
            // Remove a vaga do banco de dados (e as candidaturas associadas)
            await handleTerminateJob(currentReviewJobId);
            // Limpa visualmente a lista de aplicações da vaga removida
            setApplications(curr => curr.filter(app => app.job_id !== currentReviewJobId));
            alert("Ciclo concluído! A vaga foi removida do histórico.");
        } catch (error) {
            console.error("Erro ao finalizar vaga:", error);
        }
    }
    
    // Reseta estados
    setSelectedCandidate(null);
    setCurrentReviewJobId(null);
    setHasRatedSession(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 relative">
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
        {applications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                {applications.length}
              </span>
              Candidaturas / Em Serviço
            </h2>
            <div className="space-y-3">
              {applications.map(app => {
                const isHired = app.status === 'HIRED';
                
                return (
                  <div 
                    key={app.id} 
                    className={`bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border-l-4 ${isHired ? 'border-green-600 bg-green-50' : 'border-green-500'}`}
                  >
                    
                    {/* FOTO E NOME */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100 overflow-hidden flex-shrink-0">
                         {app.worker_photo ? (
                           <img src={app.worker_photo} alt={app.worker_name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <i className="fa-solid fa-user"></i>
                           </div>
                         )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 capitalize">{app.worker_name}</p>
                        <p className="text-sm text-gray-500">vaga: {app.job_title}</p>
                        {isHired && (
                           <span className="inline-block bg-green-200 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold mt-1">
                             EM SERVIÇO
                           </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isHired ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-green-700 font-semibold mb-1">Esperando Avaliação</span>
                          <button 
                            onClick={() => handleViewProfile(app.worker_id, app.worker_name, app.job_id)}
                            className="bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-900 transition flex items-center gap-2"
                          >
                             <i className="fa-solid fa-star text-yellow-400"></i> Avaliar
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleViewProfile(app.worker_id, app.worker_name, app.job_id)}
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Suas Vagas</h2>
          <button onClick={onCreateJob} className="bg-gray-900 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700">
            <i className="fa-solid fa-plus text-sm"></i>
          </button>
        </div>

        <div className="space-y-4">
          {localJobs.map(job => {
            const interessados = counts[job.id] || 0;
            // Verifica status para definir se está finalizada
            const isFinalized = job.status === 'FILLED' || job.status === 'Preenchida' || job.status === 'Fechada';
            
            return (
              <div 
                key={job.id} 
                onClick={() => handleOpenJobDetails(job)}
                className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition relative group ${isFinalized ? 'opacity-70 bg-gray-50' : 'border-gray-100'}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800">{job.role}</h3>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1 mb-3">
                  <i className="fa-regular fa-calendar mr-1"></i>
                  {formatDateDisplay(job.date)} • {job.startTime} às {job.endTime}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-green-600 font-bold">R$ {job.dailyRate.toFixed(2)}</span>
                  <div className="flex items-center">
                    {interessados > 0 && !isFinalized && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-green-500 text-green-600 text-xs font-bold mr-2">
                        {interessados}
                      </div>
                    )}
                    
                    {/* LOGICA DO BADGE FINALIZADA / ABERTO */}
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${isFinalized ? 'bg-gray-200 text-gray-500' : 'bg-green-50 text-green-600'}`}>
                      {isFinalized ? 'FINALIZADA' : 'ABERTO'}
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

      {selectedJob && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in overflow-y-auto">
          {/* ... Modal Detalhes da Vaga (mantido igual) ... */}
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
                <span className={`text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block ${selectedJob.status === 'FILLED' ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                  {selectedJob.status === 'FILLED' ? 'FINALIZADA' : 'DIÁRIA DISPONÍVEL'}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Free para {selectedJob.role}</h1>
                <p className="text-gray-500 font-medium mb-6 flex items-center gap-2"><i className="fa-solid fa-shop text-gray-400"></i> {selectedJob.companyName}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Pagamento</p>
                      <p className="text-green-600 text-xl font-bold">R$ {selectedJob.dailyRate.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Data</p>
                      <p className="text-gray-800 text-xl font-bold">{formatDateDisplay(selectedJob.date)}</p>
                    </div>
                </div>
                <div className="mb-6">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">Horário</p>
                  <p className="text-gray-700 flex items-center gap-2"><i className="fa-regular fa-clock text-green-500"></i> {selectedJob.startTime} às {selectedJob.endTime}</p>
                </div>
                <div className="mb-6">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">Benefícios</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((b, i) => (
                      <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1"><i className="fa-solid fa-check text-xs"></i> {b}</span>
                    ))}
                  </div>
                </div>
                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Descrição</p>
                  <p className="text-sm text-gray-600 italic leading-relaxed">{selectedJob.description || "Sem descrição adicional fornecida."}</p>
                </div>
             </div>
             <div className="mt-6 pt-4 border-t border-gray-100 pb-6">
               {showDeleteConfirm ? (
                 <div className="flex gap-4 animate-fade-in">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition text-lg">Cancelar</button>
                    <button onClick={() => handleTerminateJob(selectedJob.id)} className="flex-1 bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 text-lg flex items-center justify-center gap-2"><i className="fa-solid fa-trash"></i> Confirmar</button>
                 </div>
               ) : (
                 <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-4 rounded-xl hover:bg-red-100 transition text-lg">Encerrar Vaga</button>
               )}
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT BIO --- */}
      {showCompanyBio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
             {/* ... Conteúdo modal bio (igual) ... */}
             <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in relative overflow-hidden">
             <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-bold text-lg">Bio da Empresa</h3>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white transition"><i className="fa-solid fa-pen text-sm"></i></button>
                  )}
                </div>
                <button onClick={() => setShowCompanyBio(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
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
                    <input type="text" value={companyProfile.businessName} disabled={!isEditing} onChange={(e) => setCompanyProfile({...companyProfile, businessName: toTitleCase(e.target.value)})} className={`w-full border rounded-lg p-3 mt-1 outline-none ${!isEditing ? 'bg-gray-100 border-transparent text-gray-600' : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-500'}`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">CNPJ</label>
                    <input type="text" value={companyProfile.cnpj} disabled={!isEditing} onChange={(e) => setCompanyProfile({...companyProfile, cnpj: formatCnpj(e.target.value)})} maxLength={18} className={`w-full border rounded-lg p-3 mt-1 outline-none ${!isEditing ? 'bg-gray-100 border-transparent text-gray-600' : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-500'}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Município</label>
                      <input type="text" value={companyProfile.municipio} disabled={!isEditing} onChange={(e) => setCompanyProfile({...companyProfile, municipio: toTitleCase(e.target.value)})} className={`w-full border rounded-lg p-3 mt-1 outline-none ${!isEditing ? 'bg-gray-100 border-transparent text-gray-600' : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-500'}`} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Bairro</label>
                      <input type="text" value={companyProfile.bairro} disabled={!isEditing} onChange={(e) => setCompanyProfile({...companyProfile, bairro: toTitleCase(e.target.value)})} className={`w-full border rounded-lg p-3 mt-1 outline-none ${!isEditing ? 'bg-gray-100 border-transparent text-gray-600' : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-500'}`} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Endereço (Rua/Nº)</label>
                    <input type="text" value={companyProfile.address} disabled={!isEditing} onChange={(e) => setCompanyProfile({...companyProfile, address: toTitleCase(e.target.value)})} className={`w-full border rounded-lg p-3 mt-1 outline-none ${!isEditing ? 'bg-gray-100 border-transparent text-gray-600' : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-500'}`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Sobre a Empresa</label>
                    <textarea rows={3} value={companyProfile.description} disabled={!isEditing} onChange={(e) => setCompanyProfile({...companyProfile, description: e.target.value})} className={`w-full border rounded-lg p-3 mt-1 outline-none resize-none ${!isEditing ? 'bg-gray-100 border-transparent text-gray-600' : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-500'}`} />
                  </div>
                </div>
                {isEditing && (
                  <button onClick={handleSaveCompanyProfile} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl mt-6 hover:bg-green-700 transition shadow-lg shadow-green-100 animate-fade-in">Salvar Alterações</button>
                )}
             </div>
          </div>
        </div>
      )}

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in relative max-h-[90vh] overflow-y-auto">
            {/* BOTÃO FECHAR AGORA CHAMA A NOVA FUNÇÃO QUE VERIFICA SE DEVE EXCLUIR A VAGA */}
            <button onClick={handleCloseProfileModal} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 w-8 h-8 flex items-center justify-center z-10">
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
              
              {/* --- SISTEMA DE AVALIAÇÃO INTERATIVO --- */}
              <div className="w-full bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6 flex flex-col items-center">
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                        let starClass = "fa-regular fa-star text-gray-300"; 
                        if (editingRating >= starIndex) {
                            starClass = "fa-solid fa-star text-yellow-400"; 
                        } else if (editingRating >= starIndex - 0.5) {
                            starClass = "fa-solid fa-star-half-stroke text-yellow-400"; 
                        }
                        return <i key={starIndex} className={`${starClass} text-2xl`}></i>
                    })}
                  </div>
                  
                  <div className="w-full flex items-center gap-3">
                      <span className="font-bold text-gray-600 w-8 text-center">{editingRating.toFixed(1)}</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.5" 
                        value={editingRating}
                        onChange={(e) => setEditingRating(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                  </div>

                  <button 
                    onClick={handleSaveRating}
                    disabled={isSavingRating}
                    className="mt-3 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    {isSavingRating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                    Salvar Nota
                  </button>
              </div>
              {/* -------------------------------------- */}

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
                    <div><p className="text-xs text-gray-500">Contato / WhatsApp</p><p className="font-semibold text-gray-800">{formatPhone(selectedCandidate.phone)}</p></div>
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
              
              {/* BOTÃO FECHAR TAMBÉM NO FINAL DA LISTA */}
              <button onClick={handleCloseProfileModal} className="mt-6 w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;