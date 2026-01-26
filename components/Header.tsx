
import React from 'react';

interface HeaderProps {
  activeView: 'booking' | 'editor';
  setView: (view: 'booking' | 'editor') => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setView }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-ship text-maritime-blue text-xl"></i>
          <span className="font-bold text-maritime-blue text-lg hidden sm:inline">LADY MANOELA</span>
        </div>
        
        <nav className="flex space-x-1">
          <button 
            onClick={() => setView('booking')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeView === 'booking' 
              ? 'bg-maritime-blue text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="fa-solid fa-calendar-check mr-2"></i>
            Reserva
          </button>
          <button 
            onClick={() => setView('editor')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeView === 'editor' 
              ? 'bg-maritime-blue text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
            Personalizar Foto
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
