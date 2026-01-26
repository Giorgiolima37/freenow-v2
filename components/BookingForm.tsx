
import React, { useState } from 'react';
import { TourType, BookingFormData } from '../types';

const BookingForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    date: '',
    peopleCount: 1,
    tourType: TourType.LAGOON
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    // Simulation of success
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full">
          <i className="fa-solid fa-check text-4xl"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Reserva Solicitada!</h3>
        <p className="text-gray-600 mb-8">
          Olá <strong>{formData.fullName}</strong>, recebemos seu interesse no passeio <strong>{formData.tourType}</strong>. 
          Nossa equipe entrará em contato em breve pelo WhatsApp para confirmar os detalhes.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="bg-maritime-blue hover:bg-sky-900 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95"
        >
          Fazer outra reserva
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Bem-vindo a bordo!</h3>
        <p className="text-gray-600">Preencha os detalhes abaixo para agendar seu passeio de scuna inesquecível.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i className="fa-solid fa-user"></i>
            </span>
            <input
              required
              type="text"
              placeholder="Ex: João Silva"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-all outline-none"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i className="fa-solid fa-phone"></i>
            </span>
            <input
              required
              type="tel"
              placeholder="(00) 00000-0000"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-sky-500 focus:border-sky-500 outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do Passeio</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fa-solid fa-calendar-days"></i>
              </span>
              <input
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-sky-500 focus:border-sky-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nº de Pessoas</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fa-solid fa-users"></i>
              </span>
              <input
                required
                type="number"
                min="1"
                max="50"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-sky-500 focus:border-sky-500 outline-none"
                value={formData.peopleCount}
                onChange={(e) => setFormData({...formData, peopleCount: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Passeio</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i className="fa-solid fa-anchor"></i>
            </span>
            <select
              required
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-sky-500 focus:border-sky-500 outline-none bg-white appearance-none"
              value={formData.tourType}
              onChange={(e) => setFormData({...formData, tourType: e.target.value as TourType})}
            >
              {Object.values(TourType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-maritime-blue hover:bg-sky-900 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-4 flex items-center justify-center space-x-2"
        >
          <i className="fa-solid fa-paper-plane"></i>
          <span>Enviar Solicitação de Reserva</span>
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
