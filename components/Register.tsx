import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { BUSINESS_TYPES } from '../constants';
import { supabase } from '../lib/supabase';

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.WORKER);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar usuário na Autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Salvar dados na tabela 'profiles' incluindo campos de Empresa
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: name,
              user_type: role, // Enviará 'Trabalhador' ou 'Empresa'
              business_name: role === UserRole.COMPANY ? businessName : null,
              business_type: role === UserRole.COMPANY ? businessType : null,
            },
          ]);

        if (profileError) throw profileError;

        // 3. Objeto para o estado local do App
        const newUser: User = {
          id: authData.user.id,
          name,
          email,
          role,
          businessName: role === UserRole.COMPANY ? businessName : undefined,
          businessType: role === UserRole.COMPANY ? businessType : undefined,
        };

        alert('Cadastro realizado com sucesso!');
        onRegister(newUser);
      }
    } catch (error: any) {
      alert('Erro ao cadastrar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Criar Conta</h2>
        <p className="text-gray-500 text-sm">Escolha seu perfil no FreeNow</p>
      </div>

      <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
        <button 
          type="button"
          onClick={() => setRole(UserRole.WORKER)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${role === UserRole.WORKER ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
        >
          Trabalhador
        </button>
        <button 
          type="button"
          onClick={() => setRole(UserRole.COMPANY)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${role === UserRole.COMPANY ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
        >
          Empresa
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {role === UserRole.COMPANY && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Negócio</label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                {BUSINESS_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input 
            type="email" 
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input 
            type="password" 
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-green-600'} text-white font-semibold py-3 rounded-lg mt-4 shadow-lg active:scale-95`}
        >
          {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
        </button>
      </form>

      <button 
        type="button"
        onClick={onSwitchToLogin}
        className="mt-6 text-center text-green-600 text-sm font-semibold hover:underline w-full"
      >
        Já possui conta? Faça Login
      </button>
    </div>
  );
};

export default Register;