import React from 'react';
import {
  Play,
  Download,
  Film,
  Tv,
  CheckCircle2,
  Clock,
  HardDrive,
  Sparkles,
  Shield,
  Plus,
  Edit3,
  Layers,
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react';
import { Episode, SeriesInfo } from '../types';
import { formatBytes, formatDuration, downloadEpisodeFile } from '../utils/helpers';
import { EpisodeCard } from './EpisodeCard';

interface HomeViewProps {
  seriesInfo: SeriesInfo;
  episodes: Episode[];
  isAdmin: boolean;
  onPlayEpisode: (ep: Episode) => void;
  onGoToEpisodes: (season?: number | 'all') => void;
  onOpenUpload: () => void;
  onOpenEditSeries: () => void;
  onRequestAdmin: () => void;
  onEditEpisode: (ep: Episode) => void;
  onDeleteEpisode: (id: string) => void;
  onToggleWatched: (ep: Episode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  seriesInfo,
  episodes,
  isAdmin,
  onPlayEpisode,
  onGoToEpisodes,
  onOpenUpload,
  onOpenEditSeries,
  onRequestAdmin,
  onEditEpisode,
  onDeleteEpisode,
  onToggleWatched,
}) => {
  // Find next episode to watch: first unwatched episode, or first episode
  const nextEpisode =
    episodes.find((ep) => !ep.watched) || (episodes.length > 0 ? episodes[0] : null);

  // Group episodes by season
  const seasonsMap = React.useMemo(() => {
    const map = new Map<number, Episode[]>();
    episodes.forEach((ep) => {
      const list = map.get(ep.season) || [];
      list.push(ep);
      map.set(ep.season, list);
    });
    return map;
  }, [episodes]);

  const seasonsList = Array.from(seasonsMap.keys()).sort((a: number, b: number) => a - b);

  // Calculate total duration in minutes
  const totalDurationSec = episodes.reduce((acc, ep) => acc + (ep.duration || 0), 0);
  const watchedCount = episodes.filter((ep) => ep.watched).length;
  const progressPercent =
    episodes.length > 0 ? Math.round((watchedCount / episodes.length) * 100) : 0;

  // Recent 3 or 4 episodes for quick preview
  const recentEpisodes = [...episodes]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Showcase Banner */}
      <section className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Background Image / Banner */}
        <div className="absolute inset-0 z-0">
          {seriesInfo.bannerUrl ? (
            <img
              src={seriesInfo.bannerUrl}
              alt={seriesInfo.title}
              className="w-full h-full object-cover opacity-35 filter blur-[1px] scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-neutral-900 to-neutral-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-3xl space-y-6">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-md shadow-blue-900/30">
              Série em Destaque
            </span>
            {seriesInfo.genre && (
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-neutral-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-full">
                {seriesInfo.genre}
              </span>
            )}
            {seriesInfo.year && (
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-neutral-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-full">
                {seriesInfo.year}
              </span>
            )}
            {seriesInfo.rating && (
              <span className="px-2.5 py-1 bg-neutral-800/80 backdrop-blur-md text-neutral-200 border border-neutral-700 text-[10px] font-bold rounded-full">
                {seriesInfo.rating}
              </span>
            )}
            <span className="px-3 py-1 bg-emerald-950/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              HD 1080p
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {seriesInfo.title || 'Crônicas do Infinito'}
          </h1>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal line-clamp-3 sm:line-clamp-4">
            {seriesInfo.synopsis ||
              'Acompanhe todos os episódios completos desta série. Assista online sem travamentos pelo player integrado ou baixe os arquivos diretamente para o seu dispositivo.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {nextEpisode && (
              <button
                id="hero-play-btn"
                onClick={() => onPlayEpisode(nextEpisode)}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {watchedCount > 0 ? 'Continuar Assistindo' : 'Começar a Assistir'}
                </span>
                <span className="text-[11px] opacity-80 font-normal">
                  (T{String(nextEpisode.season).padStart(2, '0')}E{String(nextEpisode.episodeNumber).padStart(2, '0')})
                </span>
              </button>
            )}

            <button
              id="hero-episodes-btn"
              onClick={() => onGoToEpisodes('all')}
              className="flex items-center gap-2 px-5 py-3.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 font-semibold text-sm rounded-2xl transition-all cursor-pointer"
            >
              <Tv className="w-4 h-4 text-neutral-400" />
              <span>Ver Todos os Episódios ({episodes.length})</span>
            </button>

            {isAdmin ? (
              <button
                onClick={onOpenEditSeries}
                className="flex items-center gap-2 px-4 py-3.5 bg-neutral-900/70 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
                title="Editar informações da série"
              >
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>Editar Série</span>
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Bento Grid: Próximo Episódio + Painel de Acesso / Telemetria */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next / Featured Episode Card (2 Columns on MD) */}
        {nextEpisode ? (
          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                    {watchedCount > 0 ? 'Continuar Assistindo' : 'Episódio Recomendado'}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Temporada {nextEpisode.season} • Episódio {nextEpisode.episodeNumber}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {nextEpisode.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 max-w-xl">
                  {nextEpisode.description || 'Assista ou baixe este episódio com qualidade máxima.'}
                </p>
              </div>

              {nextEpisode.thumbnailUrl && (
                <div
                  onClick={() => onPlayEpisode(nextEpisode)}
                  className="w-full sm:w-44 aspect-video rounded-2xl overflow-hidden border border-neutral-700/80 shrink-0 relative cursor-pointer"
                >
                  <img
                    src={nextEpisode.thumbnailUrl}
                    alt={nextEpisode.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-white translate-x-0.5" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-5 mt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                {nextEpisode.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    {formatDuration(nextEpisode.duration)}
                  </span>
                )}
                {nextEpisode.fileSize && (
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
                    {formatBytes(nextEpisode.fileSize)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPlayEpisode(nextEpisode)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer border border-neutral-700"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Assistir Agora</span>
                </button>
                <button
                  onClick={() => downloadEpisodeFile(nextEpisode)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  title="Baixar arquivo de vídeo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
            <Film className="w-10 h-10 text-neutral-600 mb-2" />
            <h3 className="text-base font-bold text-white">Nenhum episódio cadastrado ainda</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              {isAdmin
                ? 'Você está no modo Administrador. Adicione seu primeiro episódio agora!'
                : 'Entre no modo Administrador com a senha 0409 para publicar episódios.'}
            </p>
            {isAdmin ? (
              <button
                onClick={onOpenUpload}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                Adicionar Episódio
              </button>
            ) : (
              <button
                onClick={onRequestAdmin}
                className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700"
              >
                Acessar como Administrador
              </button>
            )}
          </div>
        )}

        {/* Platform Access Mode & Stats Box (1 Column) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isAdmin ? 'bg-emerald-400 animate-pulse' : 'bg-blue-500'
                  }`}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Status da Conta
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {isAdmin ? 'Modo Administrador' : 'Modo Visualizador'}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white">
              {isAdmin ? 'Painel de Gerenciamento Ativo' : 'Acesso Livre para Visualização'}
            </h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {isAdmin
                ? 'Você possui controle total. Pode fazer upload de episódios (.mp4, .mkv), editar dados da série e excluir arquivos.'
                : 'Você pode assistir a todos os episódios pelo player online e baixar os arquivos diretamente.'}
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-neutral-800">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Progresso Assistido</span>
              <span className="font-bold text-white">
                {watchedCount}/{episodes.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {isAdmin ? (
              <button
                onClick={onOpenUpload}
                className="w-full mt-3 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Novo Episódio</span>
              </button>
            ) : (
              <button
                onClick={onRequestAdmin}
                className="w-full mt-3 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-semibold border border-neutral-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Entrar como Administrador</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Seasons Showcase (Abas por Temporada) */}
      {seasonsList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                <span>Temporadas Disponíveis</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Selecione uma temporada para explorar todos os episódios correspondentes
              </p>
            </div>
            <button
              onClick={() => onGoToEpisodes('all')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seasonsList.map((seasonNum) => {
              const seasonEpisodes = seasonsMap.get(seasonNum) || [];
              const seasonWatched = seasonEpisodes.filter((e) => e.watched).length;
              return (
                <div
                  key={seasonNum}
                  onClick={() => onGoToEpisodes(seasonNum)}
                  className="bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-blue-500/40 rounded-3xl p-5 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                        Temporada {seasonNum}
                      </span>
                      <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mt-0.5">
                        {seasonEpisodes.length} {seasonEpisodes.length === 1 ? 'Episódio' : 'Episódios'}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-neutral-800 group-hover:bg-blue-600 text-neutral-400 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                    <span>
                      {seasonWatched}/{seasonEpisodes.length} assistidos
                    </span>
                    <span className="text-neutral-500 font-medium">Acessar temporada →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recentes / Últimos Episódios Adicionados */}
      {recentEpisodes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Últimos Episódios Disponíveis</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Assista online com carregamento veloz ou faça o download imediato
              </p>
            </div>
            <button
              onClick={() => onGoToEpisodes('all')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos ({episodes.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentEpisodes.map((ep) => (
              <EpisodeCard
                key={ep.id}
                episode={ep}
                isAdmin={isAdmin}
                onRequestAdmin={onRequestAdmin}
                onPlay={onPlayEpisode}
                onEdit={onEditEpisode}
                onDelete={onDeleteEpisode}
                onToggleWatched={onToggleWatched}
              />
            ))}
          </div>
        </section>
      )}

      {/* Technical Specifications / FAQ Bento Strip */}
      <section className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Player Integrado Cinema</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Interface moderna com atalhos de teclado (Espaço, setas de navegação, F para tela cheia e M para mudo), além de botão de próximo episódio automático.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Downloads Sem Limite</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Qualquer visitante pode baixar os episódios originais direto para o computador ou celular com um único clique no botão de download.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Console Admin Seguro</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Protegido por senha (PIN 0409) para assegurar que apenas administradores façam upload, editem a sinopse e façam exclusões.
          </p>
        </div>
      </section>
    </div>
  );
};
