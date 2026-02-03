
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Camera, X, Wand2, Loader2, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface Props {
  product: Product;
  onSave: (url: string) => void;
  onClose: () => void;
}

const ImageEditor: React.FC<Props> = ({ product, onSave, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(product.imageUrl || 'https://picsum.photos/400/400');
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiEdit = async () => {
    if (!prompt) return;
    setIsProcessing(true);
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Convert current image to base64 data
      const base64Data = currentImageUrl.split(',')[1];
      const mimeType = currentImageUrl.match(/data:(.*?);/)?.[1] || 'image/png';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Edite esta imagem de produto (${product.name}) conforme o pedido: ${prompt}. Retorne apenas a imagem editada.`,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const newBase64 = part.inlineData.data;
          setCurrentImageUrl(`data:image/png;base64,${newBase64}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error('A IA não retornou uma imagem editada.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao processar imagem: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row h-[600px]">
        {/* Left: Preview */}
        <div className="flex-1 bg-slate-900 flex flex-col relative group">
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <img src={currentImageUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform" />
          </div>
          
          <div className="absolute top-4 left-4">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Preview</span>
          </div>

          <div className="p-4 bg-black/40 backdrop-blur-md flex justify-center space-x-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center transition"
            >
              <Camera size={18} className="mr-2" /> Upload
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-80 p-6 flex flex-col border-l">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center">
              <Sparkles className="text-blue-600 mr-2" size={24} /> IA Editor
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-auto">
            <p className="text-sm text-slate-500">Use comandos de voz ou texto para editar a foto do produto usando Gemini 2.5 Flash Image.</p>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
              <p className="text-xs font-bold text-blue-800 mb-1">Dicas:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc ml-4">
                <li>"Remova o fundo"</li>
                <li>"Adicione sombra"</li>
                <li>"Aumente o brilho"</li>
                <li>"Torne as cores mais vibrantes"</li>
              </ul>
            </div>

            <textarea 
              className="w-full h-32 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              placeholder="Descreva a alteração..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>

            {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>}

            <button 
              onClick={handleAiEdit}
              disabled={isProcessing || !prompt}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-slate-800 disabled:bg-slate-200 transition"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} /> Processando...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2" size={20} /> Aplicar Magia
                </>
              )}
            </button>
          </div>

          <div className="pt-6 border-t mt-auto">
            <button 
              onClick={() => onSave(currentImageUrl)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
