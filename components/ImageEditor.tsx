
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;

    setLoading(true);
    setError(null);
    try {
      const result = await editImage(image, mimeType, prompt);
      if (result) {
        setEditedImage(result);
      } else {
        setError("Não foi possível processar a edição. Tente novamente.");
      }
    } catch (err: any) {
      setError("Ocorreu um erro ao editar a imagem. Verifique sua chave de API ou tente um prompt diferente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `lady-manoela-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalize sua Experiência</h3>
        <p className="text-gray-600">
          Envie uma foto e use o poder da IA do <strong>Gemini 2.5</strong> para adicionar filtros, elementos marítimos ou o que desejar!
        </p>
      </div>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-maritime-blue transition-colors bg-gray-50"
        >
          <div className="w-16 h-16 bg-sky-100 text-maritime-blue rounded-full flex items-center justify-center mb-4">
            <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
          </div>
          <p className="text-gray-600 font-medium text-center">Clique ou arraste uma foto aqui para começar</p>
          <p className="text-gray-400 text-xs mt-2">JPG, PNG ou WEBP</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative group overflow-hidden rounded-xl border border-gray-200">
            <img 
              src={editedImage || image} 
              alt="Preview" 
              className="w-full max-h-80 object-contain bg-black/5" 
            />
            <button 
              onClick={() => { setImage(null); setEditedImage(null); }}
              className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            {loading && (
              <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maritime-blue mb-4"></div>
                <p className="text-maritime-blue font-bold animate-pulse">O Gemini está editando sua foto...</p>
              </div>
            )}
          </div>

          {!editedImage ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O que deseja fazer?</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Adicione um pôr do sol tropical, coloque um golfinho pulando ao fundo, adicione um filtro vintage marítimo..."
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <button
                onClick={handleEdit}
                disabled={loading || !prompt}
                className={`w-full font-bold py-4 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  loading || !prompt 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-maritime-blue hover:bg-sky-900 text-white'
                }`}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>Gerar Edição com IA</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={downloadImage}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <i className="fa-solid fa-download"></i>
                <span>Baixar Foto</span>
              </button>
              <button
                onClick={() => setEditedImage(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl shadow transition-all flex items-center justify-center"
              >
                Refazer
              </button>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start space-x-2">
              <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <i className="fa-solid fa-lightbulb text-yellow-500 mr-2"></i>
          Sugestões de prompts:
        </h4>
        <div className="flex flex-wrap gap-2">
          {['Pôr do sol cinematográfico', 'Filtro analógico anos 90', 'Céu azul cristalino', 'Vibe tropical verão'].map((sug) => (
            <button
              key={sug}
              onClick={() => setPrompt(sug)}
              className="text-xs bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full border border-sky-100 hover:bg-sky-100 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
