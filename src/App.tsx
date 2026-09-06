import React, { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Plus,
  Tv,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Sparkles,
  Info,
  Lock,
  Unlock,
  LogOut,
  Home,
  Eye,
  Shield,
} from 'lucide-react';
import { Episode, SeriesInfo } from './types';
import {
  getAllEpisodes,
  saveEpisode,
  deleteEpisode,
  getSeriesInfo,
  saveSeriesInfo,
  clearAllEpisodes,
  DEFAULT_SERIES_INFO,
} from './utils/db';
import { Header } from './components/Header';
import { EpisodeCard } from './components/EpisodeCard';
import { EpisodeUploadModal } from './components/EpisodeUploadModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { SeriesEditModal } from './components/SeriesEditModal';
import { SeasonFilter } from './components/SeasonFilter';
import { EmptyState } from './components/EmptyState';
import { HomeView } from './components/HomeView';
import { AdminAuthModal } from './components/AdminAuthModal';

export default function App() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seriesInfo, setSeriesInfo] = useState<SeriesInfo>(DEFAULT_SERIES_INFO);
  const [isLoading, setIsLoading] = useState(true);

  // Active view tab: 'home' (Início) or 'episodes' (Catálogo completo)
  const [currentTab, setCurrentTab] = useState<'home' | 'episodes'>('home');

  // Role: Viewer by default, unlocked with password 0409
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);

  // Filters & Sorting
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'number' | 'date' | 'title'>('number');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditSeriesOpen, setIsEditSeriesOpen] = useState(false);
  const [episodeToEdit, setEpisodeToEdit] = useState<Episode | null>(null);
  const [activePlayEpisode, setActivePlayEpisode] = useState<Episode | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load database on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [loadedEpisodes, loadedInfo] = await Promise.all([
          getAllEpisodes(),
          getSeriesInfo(),
        ]);
        setEpisodes(loadedEpisodes);
        setSeriesInfo(loadedInfo);
      } catch (err) {
        console.error('Erro ao carregar dados do banco local:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Distinct seasons list
  const seasons = useMemo(() => {
    const set = new Set<number>(episodes.map((e) => e.season));
    return Array.from(set).sort((a: number, b: number) => a - b);
  }, [episodes]);

  // Filter & Sort episodes
  const filteredEpisodes = useMemo(() => {
    return episodes
      .filter((ep) => {
        if (selectedSeason !== 'all' && ep.season !== selectedSeason) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = ep.title.toLowerCase().includes(q);
          const matchDesc = (ep.description || '').toLowerCase().includes(q);
          const matchNumber = `ep ${ep.episodeNumber}`.includes(q) || `e${ep.episodeNumber}`.includes(q);
          return matchTitle || matchDesc || matchNumber;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'number') {
          if (a.season !== b.season) return a.season - b.season;
          return a.episodeNumber - b.episodeNumber;
        }
        if (sortBy === 'date') {
          return b.createdAt - a.createdAt;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [episodes, selectedSeason, searchQuery, sortBy]);

  // Admin login success handler
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    showToast('Modo Administrador ativado! Agora você pode gerenciar a série e episódios.', 'success');
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    setIsAdmin(false);
    showToast('Sessão de administrador encerrada. Você voltou ao Modo Visualizador.', 'info');
  };

  // Save episode (restricted to admin or validated)
  const handleSaveEpisode = async (episode: Episode) => {
    await saveEpisode(episode);
    const updated = await getAllEpisodes();
    setEpisodes(updated);
    showToast(`Episódio "${episode.title}" salvo com sucesso!`, 'success');
  };

  // Delete episode
  const handleDeleteEpisode = async (id: string) => {
    await deleteEpisode(id);
    setEpisodes((prev) => prev.filter((e) => e.id !== id));
    if (activePlayEpisode?.id === id) {
      setActivePlayEpisode(null);
    }
    showToast('Episódio removido com sucesso.', 'info');
  };

  // Toggle watched (available to all viewers locally)
  const handleToggleWatched = async (episode: Episode) => {
    const updated = { ...episode, watched: !episode.watched };
    await saveEpisode(updated);
    setEpisodes((prev) => prev.map((e) => (e.id === episode.id ? updated : e)));
    if (activePlayEpisode?.id === episode.id) {
      setActivePlayEpisode(updated);
    }
  };

  // Save Series info
  const handleSaveSeriesInfo = async (info: SeriesInfo) => {
    await saveSeriesInfo(info);
    setSeriesInfo(info);
    showToast('Dados da série atualizados!', 'success');
  };

  // Reset sample episodes
  const handleResetSamples = async () => {
    await clearAllEpisodes();
    const loaded = await getAllEpisodes();
    setEpisodes(loaded);
    showToast('Episódios de exemplo recarregados!', 'info');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & View Navigation Tabs */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/30 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  Portal de Séries
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">
                  Streaming & Download
                </span>
              </div>
            </div>

            {/* Início / Episódios Switcher */}
            <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <button
                id="nav-tab-home"
                onClick={() => setCurrentTab('home')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'home'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Início</span>
              </button>

              <button
                id="nav-tab-episodes"
                onClick={() => setCurrentTab('episodes')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'episodes'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Episódios</span>
                {episodes.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      currentTab === 'episodes'
                        ? 'bg-blue-800 text-white'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {episodes.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Area: Viewer / Admin Status & Action Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs font-bold text-emerald-400 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Modo Admin</span>
                </div>

                <button
                  id="nav-add-btn"
                  onClick={() => {
                    setEpisodeToEdit(null);
                    setIsUploadModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-900/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  title="Fazer upload de novo episódio"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Adicionar Episódio</span>
                  <span className="sm:hidden">Novo</span>
                </button>

                <button
                  id="nav-logout-btn"
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/40 text-xs font-semibold transition-all cursor-pointer"
                  title="Sair do modo administrador"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sair</span>
                </button>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-400">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Visualizador</span>
                </div>

                <button
                  id="btn-top-admin"
                  onClick={() => setIsAdminAuthOpen(true)}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:border-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
                  title="Entrar com a senha de administrador (0409) para gerenciar"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Área Admin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'home' ? (
          /* "Início" / Vitrine Principal */
          <HomeView
            seriesInfo={seriesInfo}
            episodes={episodes}
            isAdmin={isAdmin}
            onPlayEpisode={(ep) => setActivePlayEpisode(ep)}
            onGoToEpisodes={(season) => {
              if (season !== undefined) {
                setSelectedSeason(season);
              }
              setCurrentTab('episodes');
            }}
            onOpenUpload={() => {
              if (isAdmin) {
                setEpisodeToEdit(null);
                setIsUploadModalOpen(true);
              } else {
                setIsAdminAuthOpen(true);
              }
            }}
            onOpenEditSeries={() => {
              if (isAdmin) {
                setIsEditSeriesOpen(true);
              } else {
                setIsAdminAuthOpen(true);
              }
            }}
            onRequestAdmin={() => setIsAdminAuthOpen(true)}
            onEditEpisode={(ep) => {
              if (isAdmin) {
                setEpisodeToEdit(ep);
                setIsUploadModalOpen(true);
              } else {
                setIsAdminAuthOpen(true);
              }
            }}
            onDeleteEpisode={handleDeleteEpisode}
            onToggleWatched={handleToggleWatched}
          />
        ) : (
          /* "Episódios" / Catálogo Completo */
          <div className="space-y-6">
            <Header
              seriesInfo={seriesInfo}
              episodes={episodes}
              isAdmin={isAdmin}
              onRequestAdmin={() => setIsAdminAuthOpen(true)}
              onOpenUpload={() => {
                if (isAdmin) {
                  setEpisodeToEdit(null);
                  setIsUploadModalOpen(true);
                } else {
                  setIsAdminAuthOpen(true);
                }
              }}
              onOpenEditSeries={() => {
                if (isAdmin) {
                  setIsEditSeriesOpen(true);
                } else {
                  setIsAdminAuthOpen(true);
                }
              }}
              onPlayEpisode={(ep) => setActivePlayEpisode(ep)}
            />

            {/* Season Filter & Search Toolbar */}
            <SeasonFilter
              seasons={seasons}
              selectedSeason={selectedSeason}
              onSelectSeason={setSelectedSeason}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filteredCount={filteredEpisodes.length}
            />

            {/* Loading Indicator */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-3xl bg-neutral-900 border border-neutral-800" />
                ))}
              </div>
            ) : filteredEpisodes.length === 0 ? (
              <EmptyState
                isSearch={Boolean(searchQuery.trim())}
                isAdmin={isAdmin}
                onRequestAdmin={() => setIsAdminAuthOpen(true)}
                onOpenUpload={() => {
                  if (isAdmin) {
                    setEpisodeToEdit(null);
                    setIsUploadModalOpen(true);
                  } else {
                    setIsAdminAuthOpen(true);
                  }
                }}
                onResetSamples={handleResetSamples}
                onClearSearch={() => setSearchQuery('')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredEpisodes.map((ep) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    isAdmin={isAdmin}
                    onRequestAdmin={() => setIsAdminAuthOpen(true)}
                    onPlay={(selected) => setActivePlayEpisode(selected)}
                    onEdit={(selected) => {
                      if (isAdmin) {
                        setEpisodeToEdit(selected);
                        setIsUploadModalOpen(true);
                      } else {
                        setIsAdminAuthOpen(true);
                      }
                    }}
                    onDelete={handleDeleteEpisode}
                    onToggleWatched={handleToggleWatched}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-6 mt-12 text-neutral-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Portal de Séries • Modo {isAdmin ? 'Administrador' : 'Visualizador'} ativo. Reprodução online e download de arquivos locais.
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setCurrentTab(currentTab === 'home' ? 'episodes' : 'home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Alternar para {currentTab === 'home' ? 'Episódios' : 'Início'}
            </button>
            <span>•</span>
            {isAdmin ? (
              <button
                onClick={() => setIsEditSeriesOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Configurar Série
              </button>
            ) : (
              <button
                onClick={() => setIsAdminAuthOpen(true)}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Lock className="w-3 h-3 text-neutral-400" />
                <span>Área do Administrador (0409)</span>
              </button>
            )}
            <span>•</span>
            <button
              onClick={handleResetSamples}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Restaurar Amostras
            </button>
          </div>
        </div>
      </footer>

      {/* Video Player Modal */}
      {activePlayEpisode && (
        <VideoPlayerModal
          episode={activePlayEpisode}
          seriesInfo={seriesInfo}
          allEpisodes={filteredEpisodes.length > 0 ? filteredEpisodes : episodes}
          onClose={() => setActivePlayEpisode(null)}
          onSelectEpisode={(ep) => setActivePlayEpisode(ep)}
          onToggleWatched={handleToggleWatched}
        />
      )}

      {/* Episode Upload & Edit Modal (Only accessible in Admin) */}
      <EpisodeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEpisodeToEdit(null);
        }}
        onSaveEpisode={handleSaveEpisode}
        existingEpisodes={episodes}
        episodeToEdit={episodeToEdit}
      />

      {/* Series Details Edit Modal (Only accessible in Admin) */}
      <SeriesEditModal
        isOpen={isEditSeriesOpen}
        onClose={() => setIsEditSeriesOpen(false)}
        seriesInfo={seriesInfo}
        onSaveSeriesInfo={handleSaveSeriesInfo}
      />

      {/* Admin Password Authentication Modal (Password: 0409) */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl text-white text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
