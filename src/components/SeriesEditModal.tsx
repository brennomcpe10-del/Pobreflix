import React, { useState, useEffect, useRef } from 'react';
import { X, Tv, Image as ImageIcon, CheckCircle2, Sparkles } from 'lucide-react';
import { SeriesInfo } from '../types';

interface SeriesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesInfo: SeriesInfo;
  onSaveSeriesInfo: (info: SeriesInfo) => Promise<void>;
}

export const SeriesEditModal: React.FC<SeriesEditModalProps> = ({
  isOpen,
  onClose,
  seriesInfo,
  onSaveSeriesInfo,
}) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [rating, setRating] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(seriesInfo.title);
      setGenre(seriesInfo.genre);
      setYear(seriesInfo.year);
      setSynopsis(seriesInfo.synopsis);
      setRating(seriesInfo.rating || '14+');
      setBannerUrl(seriesInfo.bannerUrl || '');
    }
  }, [isOpen, seriesInfo]);

  if (!isOpen) return null;

  const handleBannerUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBannerUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSeriesInfo({
        title: title.trim() || 'Minha Série',
        genre: genre.trim(),
        year: year.trim(),
        synopsis: synopsis.trim(),
        rating: rating.trim(),
        bannerUrl: bannerUrl.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar detalhes da série:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        id="series-edit-modal"
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-neutral-100"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Metadados</span>
              </div>
              <h2 className="text-lg font-bold text-white">Editar Dados da Série</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Título da Série *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Breaking Bad, Stranger Things, etc."
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none text-white text-sm placeholder-neutral-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Gênero
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Ex: Drama, Ficção, Ação"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none text-white text-sm placeholder-neutral-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Ano de Lançamento
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Ex: 2024"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none text-white text-sm placeholder-neutral-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Classificação
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors cursor-pointer"
              >
                <option value="Livre">Livre para todos os públicos</option>
                <option value="10+">10+</option>
                <option value="12+">12+</option>
                <option value="14+">14+</option>
                <option value="16+">16+</option>
                <option value="18+">18+</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Sinopse Geral
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Descreva sobre o que a série se trata..."
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none text-white text-sm placeholder-neutral-500 transition-colors resize-none"
            />
          </div>

          {/* Banner / Poster */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Imagem de Fundo / Capa
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://exemplo.com/poster.jpg"
                className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none text-white text-xs placeholder-neutral-500 transition-colors"
              />
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleBannerUpload(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                title="Carregar imagem do seu computador"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                Upload
              </button>
            </div>

            {bannerUrl && (
              <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-neutral-800 mt-2">
                <img
                  src={bannerUrl}
                  alt="Pré-visualização da capa"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-blue-900/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
