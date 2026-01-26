
import React, { useState } from 'react';
import BookingForm from './components/BookingForm';
import ImageEditor from './components/ImageEditor';
import Header from './components/Header';
import Footer from './components/Footer';

type View = 'booking' | 'editor';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('booking');

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeView={activeView} setView={setActiveView} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-maritime-blue p-6 text-white text-center">
            <h2 className="text-2xl font-bold uppercase tracking-wider">
              LADY MANOELA
            </h2>
            <p className="text-sky-100 mt-1 opacity-90">Passeios de Scuna</p>
          </div>
          
          <div className="p-6 md:p-10">
            {activeView === 'booking' ? (
              <BookingForm />
            ) : (
              <ImageEditor />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
