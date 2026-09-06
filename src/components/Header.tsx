import React from 'react';
import { Plus, Edit3, Tv, Film, Lock, Shield } from 'lucide-react';
import { SeriesInfo, Episode } from '../types';

interface HeaderProps {
  seriesInfo: SeriesInfo;
  episodes: Episode[];
  isAdmin?: boolean;
  onRequestAdmin?: () => void;
  onOpenUpload: () => void;
  onOpenEditSeries: () => void;
  onPlayEpisode?: (ep: Episode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  seriesInfo,
  isAdmin = false,
  onRequestAdmin,
  onOpenUpload,
  onOpenEditSeries,
}) => {
  const seriesInitial = (seriesInfo.title || 'S').trim().charAt(0).toUpperCase();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-900/50 border border-neutral-800 p-4 sm:px-6 rounded-3xl gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
          {seriesInitial}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{seriesInfo.title || 'Portal de Séries'}</span>
              <span className="text-neutral-500 font-normal text-xs sm:text-sm">
                / {seriesInfo.genre || 'Série'}
              </span>
            </h1>
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
              }`}
            >
              {isAdmin ? 'Admin' : 'Visualizador'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-2">
            {seriesInfo.year && <span>{seriesInfo.year}</span>}
            {seriesInfo.rating && (
              <>
                <span>•</span>
                <span className="text-neutral-300 font-bold">{seriesInfo.rating}</span>
              </>
            )}
            <span>•</span>
            <span className="text-neutral-500">Player Cinema & Downloads Rápidos</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <button
          id="btn-edit-series"
          onClick={() => {
            if (isAdmin) {
              onOpenEditSeries();
            } else {
              onRequestAdmin?.();
            }
          }}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-neutral-800/90 hover:bg-neutral-700/90 rounded-xl text-xs sm:text-sm font-medium text-neutral-200 border border-neutral-700/70 transition-all cursor-pointer"
          title={isAdmin ? 'Configurar metadados da série' : 'Requer senha de administrador (0409)'}
        >
          <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
          <span>Configurar Série</span>
          {!isAdmin && <Lock className="w-3 h-3 text-neutral-400" />}
        </button>

        <button
          id="btn-add-episode"
          onClick={() => {
            if (isAdmin) {
              onOpenUpload();
            } else {
              onRequestAdmin?.();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          title={isAdmin ? 'Adicionar novo episódio' : 'Requer senha de administrador (0409)'}
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Episódio</span>
          {!isAdmin && <Lock className="w-3.5 h-3.5 text-blue-200" />}
        </button>
      </div>
    </header>
  );
};


