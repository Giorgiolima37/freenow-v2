
import React, { useState, useRef } from 'react';
import { editTourImage } from '../services/geminiService';
import { Icons } from '../constants';

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;

    setIsProcessing(true);
    setError(null);
    try {
      const editedImageUrl = await editTourImage(image, prompt);
      if (editedImageUrl) {
        setImage(editedImageUrl);
      } else {
        setError("Não foi possível processar a imagem. Tente novamente.");
      }
    } catch (err) {
      setError("Ocorreu um erro ao conectar com a IA. Verifique sua conexão.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="editor" className="py-20 bg-sky-900 text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Eternize suas Memórias com IA</h2>
          <p className="text-sky-100 text-lg">
            Suba sua foto do passeio e peça para nossa IA fazer edições mágicas: 
            "Adicione um filtro retrô", "Remova o fundo" ou "Melhore as cores do pôr do sol".
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center bg-white/10 p-8 rounded-3xl backdrop-blur-md">
          <div className="space-y-6">
            <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-sky-400/30 relative">
              {image ? (
                <img src={image} alt="Sua foto" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <div className="bg-sky-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.Camera />
                  </div>
                  <p className="text-sky-200">Nenhuma imagem selecionada</p>
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-400 border-t-transparent mb-4"></div>
                  <p className="font-medium">Nossa IA está trabalhando...</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-white text-sky-900 py-3 px-6 rounded-xl font-bold hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
              >
                <Icons.Camera /> Carregar Foto
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-sky-200">O que você quer fazer na foto?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Ex: "Deixe as cores do céu mais vibrantes como um pôr do sol" ou "Adicione um efeito de filme antigo"'
                className="w-full h-32 bg-sky-950/50 border border-sky-400/30 rounded-xl p-4 text-white placeholder-sky-400/50 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleEdit}
              disabled={!image || !prompt || isProcessing}
              className="w-full bg-sky-400 text-sky-950 py-4 px-8 rounded-xl font-bold hover:bg-sky-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-sky-400/20"
            >
              <Icons.Magic />
              {isProcessing ? 'Processando...' : 'Aplicar Edição IA'}
            </button>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="text-xs text-sky-300 italic">
              * Esta ferramenta usa a inteligência artificial Gemini 2.5 Flash para processar suas imagens.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageEditor;
