
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="text-gray-400 hover:text-maritime-blue transition-colors">
            <i className="fa-brands fa-whatsapp text-2xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-maritime-blue transition-colors">
            <i className="fa-brands fa-instagram text-2xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-maritime-blue transition-colors">
            <i className="fa-brands fa-facebook text-2xl"></i>
          </a>
        </div>
        <p className="text-gray-500 text-sm font-medium">LADY MANOELA – Passeios de Scuna</p>
        <p className="text-gray-400 text-xs mt-1">© 2024 Todos os direitos reservados. Arraial do Cabo - RJ</p>
      </div>
    </footer>
  );
};

export default Footer;
