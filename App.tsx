
import React, { useState, useEffect } from 'react';
import { Section, Tour, ReservationFormData } from './types';
import { TOURS, Icons } from './constants';
import ImageEditor from './components/ImageEditor';

const App: React.FC = () => {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleTourSelect = (tour: Tour) => {
    setSelectedTour(tour);
    scrollToSection('reservation');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="text-sky-600">
              <Icons.Boat />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">FloripaBoat</span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('home')} className="hover:text-sky-600 transition-colors uppercase tracking-wider">Home</button>
            <button onClick={() => scrollToSection('tours')} className="hover:text-sky-600 transition-colors uppercase tracking-wider">Passeios</button>
            <button onClick={() => scrollToSection('info')} className="hover:text-sky-600 transition-colors uppercase tracking-wider">Informações</button>
            <button onClick={() => scrollToSection('editor')} className="hover:text-sky-600 transition-colors uppercase tracking-wider text-sky-600">Editor IA</button>
          </div>

          <button 
            onClick={() => scrollToSection('reservation')}
            className="hidden md:block bg-sky-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-sky-700 transition-all shadow-md shadow-sky-200"
          >
            PRÉ-RESERVA
          </button>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`w-6 h-0.5 bg-slate-800 mb-1.5 transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-slate-800 mb-1.5 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-slate-800 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 flex flex-col p-4 gap-4 animate-in slide-in-from-top">
            <button onClick={() => scrollToSection('home')} className="text-left font-semibold p-2">Home</button>
            <button onClick={() => scrollToSection('tours')} className="text-left font-semibold p-2">Passeios</button>
            <button onClick={() => scrollToSection('info')} className="text-left font-semibold p-2">Informações</button>
            <button onClick={() => scrollToSection('editor')} className="text-left font-semibold p-2 text-sky-600">Editor IA</button>
            <button onClick={() => scrollToSection('reservation')} className="bg-sky-600 text-white p-3 rounded-lg font-bold">PRÉ-RESERVA</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://picsum.photos/seed/floripa/1920/1080" alt="Lagoa da Conceição" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-slate-50"></div>
        </div>
        
        <div className="container mx-auto px-4 relative text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">Descubra o Coração de Florianópolis</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto drop-shadow-md font-light">
            Passeios de barco inesquecíveis pela Lagoa da Conceição, Piscinas Naturais e o charmoso Canal da Barra da Lagoa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('reservation')}
              className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl"
            >
              Fazer Pré-Reserva
            </button>
            <button 
              onClick={() => scrollToSection('tours')}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-10 py-4 rounded-full font-bold text-lg border border-white/50 transition-all"
            >
              Conhecer Passeios
            </button>
          </div>
          
          <div className="mt-16 flex justify-center gap-8 text-sm font-medium opacity-90">
            <div className="flex items-center gap-2"><Icons.Clock /> 10:00 - 18:00</div>
            <div className="flex items-center gap-2"><Icons.Users /> Mín. 15 pessoas</div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-800">Nossos Passeios</h2>
          <div className="w-20 h-1 bg-sky-500 mx-auto rounded-full"></div>
          <p className="mt-6 text-slate-600 max-w-xl mx-auto">
            Escolha a rota que mais combina com você e prepare-se para momentos de puro lazer em Santa Catarina.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TOURS.map(tour => (
            <div key={tour.id} className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200 group hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="h-64 relative overflow-hidden">
                <img src={tour.image} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full font-bold text-sky-600 text-sm">
                  R$ {tour.price.toFixed(2)}
                </div>
              </div>
              <div className="p-8 flex-grow">
                <div className="flex items-center gap-2 text-sky-500 text-xs font-bold uppercase tracking-widest mb-3">
                  <Icons.Clock /> {tour.duration}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800 leading-tight">{tour.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {tour.description}
                </p>
                <button 
                  onClick={() => handleTourSelect(tour)}
                  className="w-full py-3 px-6 rounded-xl border-2 border-sky-600 text-sky-600 font-bold hover:bg-sky-600 hover:text-white transition-all"
                >
                  Selecionar este Passeio
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tour Info & Details Section */}
      <section id="info" className="py-24 bg-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-8 text-slate-800">Detalhes do Roteiro</h2>
              <div className="space-y-12">
                <div>
                  <h4 className="font-bold text-sky-600 mb-4 flex items-center gap-2">
                    <Icons.MapPin /> Itinerário Sugerido
                  </h4>
                  <ul className="space-y-4">
                    {(selectedTour || TOURS[0]).itinerary.map((item, idx) => (
                      <li key={idx} className="flex gap-4">
                        <span className="w-6 h-6 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4">Formas de Pagamento</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['Cartão de Débito', 'Cartão de Crédito', 'Pix', 'Dinheiro'].map(method => (
                      <div key={method} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-2 h-2 bg-sky-400 rounded-full"></div> {method}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-400 font-medium italic">
                    * Crianças de 0 a 4 anos não pagam.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="h-[400px] bg-slate-300 rounded-3xl overflow-hidden relative shadow-inner">
                 {/* Map Placeholder */}
                 <div className="absolute inset-0 flex items-center justify-center bg-sky-100">
                   <div className="text-center p-8">
                     <Icons.MapPin />
                     <p className="mt-4 font-bold text-slate-800">Referência de Embarque</p>
                     <p className="text-sm text-slate-600">Final da Avenida das Rendeiras, ao lado do Bar do Boni.</p>
                     <div className="mt-6 w-full h-32 bg-sky-200/50 rounded-xl border border-sky-300/50 flex items-center justify-center overflow-hidden">
                       <span className="text-xs text-sky-600 font-bold uppercase tracking-widest">MAPA INTERATIVO</span>
                     </div>
                   </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <img src="https://picsum.photos/seed/floripa1/400/300" className="rounded-2xl h-40 w-full object-cover" alt="Galeria" />
                <img src="https://picsum.photos/seed/floripa2/400/300" className="rounded-2xl h-40 w-full object-cover" alt="Galeria" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Editor Feature (AI) */}
      <ImageEditor />

      {/* Reservation Form Section */}
      <section id="reservation" className="py-24 container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:row-span-2 md:flex-row border border-slate-100">
          <div className="md:w-2/5 bg-sky-600 p-12 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">Sua Aventura Começa Aqui</h2>
              <p className="text-sky-100 mb-8 leading-relaxed">
                Preencha o formulário para garantir sua vaga. Entraremos em contato assim que o grupo mínimo for atingido.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Icons.Users />
                  </div>
                  <div>
                    <h4 className="font-bold">Política de Grupo</h4>
                    <p className="text-sm text-sky-100">Saída confirmada com mín. de 15 pagantes.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Icons.Clock />
                  </div>
                  <div>
                    <h4 className="font-bold">Horário de Operação</h4>
                    <p className="text-sm text-sky-100">Segunda a Domingo: 10:00 às 18:00.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-4 bg-sky-700/50 rounded-xl border border-sky-400/30 text-xs italic">
              "Sua pré-reserva é gratuita. O pagamento é realizado apenas no momento do embarque."
            </div>
          </div>

          <div className="md:w-3/5 p-12">
            {formSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Pré-Reserva Recebida!</h3>
                <p className="text-slate-600 mb-8">
                  Sua pré-reserva foi processada com sucesso. Entraremos em contato para confirmar assim que o grupo estiver completo.
                </p>
                <button 
                  onClick={() => setFormSubmitted(false)}
                  className="text-sky-600 font-bold hover:underline"
                >
                  Fazer outra reserva
                </button>
              </div>
            ) : (
              <form 
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormSubmitted(true);
                }}
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                    <input required type="text" placeholder="Como podemos te chamar?" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">WhatsApp / Telefone</label>
                    <input required type="tel" placeholder="(48) 99999-9999" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Data do Passeio</label>
                    <input required type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Número de Pessoas</label>
                    <input required type="number" min="1" placeholder="Quantos vêm com você?" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tipo de Passeio</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                    value={selectedTour?.id || ''}
                    onChange={(e) => {
                      const tour = TOURS.find(t => t.id === e.target.value);
                      if (tour) setSelectedTour(tour);
                    }}
                  >
                    <option value="" disabled>Selecione uma opção</option>
                    {TOURS.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (R$ {t.price.toFixed(2)})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition-all shadow-lg shadow-slate-200">
                    Confirmar Pré-Reserva
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4 px-8">
                    * Ao clicar em confirmar, você aceita nossa política de formação de grupo mínimo de 15 pessoas.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Icons.Boat />
                <span className="text-2xl font-bold tracking-tight">FloripaBoat</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-6">
                Sua melhor opção de lazer náutico na Lagoa da Conceição. Experiências únicas com segurança e profissionalismo em Florianópolis.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-sky-600 transition-colors">
                  <Icons.Instagram />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-sky-400">Contatos</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li>(48) 99999-9999</li>
                <li>contato@floripaboat.com.br</li>
                <li>Avenida das Rendeiras, s/n</li>
                <li>Florianópolis - SC</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sky-400">Links Rápidos</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('tours')} className="hover:text-white transition-colors">Passeios</button></li>
                <li><button onClick={() => scrollToSection('info')} className="hover:text-white transition-colors">Informações</button></li>
                <li><button onClick={() => scrollToSection('reservation')} className="hover:text-white transition-colors">Reserva</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:row-span-2 md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
            <span>© 2024 Floripa Boat Tours. Todos os direitos reservados.</span>
            <span>Ao lado do Bar do Boni, Lagoa da Conceição</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
