import { Episode, SeriesInfo } from '../types';

const DB_NAME = 'SeriesEpisodesDB';
const DB_VERSION = 1;
const EPISODES_STORE = 'episodes';
const SETTINGS_STORE = 'settings';

export const DEFAULT_SERIES_INFO: SeriesInfo = {
  title: 'Crônicas do Infinito',
  synopsis: 'Em um mundo onde a tecnologia e o mistério se entrelaçam, uma equipe de exploradores desafia os limites do espaço e do tempo em busca de respostas sobre o passado esquecido da humanidade.',
  genre: 'Ficção Científica • Aventura • Mistério',
  year: '2025',
  bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
  rating: '14+',
};

// Initial demo episodes so user has instant playable and downloadable examples
const INITIAL_DEMO_EPISODES: Omit<Episode, 'videoBlob'>[] = [
  {
    id: 'demo-s01e01',
    title: 'O Primeiro Contato',
    season: 1,
    episodeNumber: 1,
    description: 'Após detectar uma transmissão misteriosa nas profundezas da órbita lunar, a tripulação da nave Horizon inicia uma jornada sem volta.',
    duration: 596, // ~10 min
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    fileName: 'S01E01_O_Primeiro_Contato.mp4',
    fileSize: 158000000,
    fileType: 'video/mp4',
    createdAt: Date.now() - 86400000 * 3,
    watched: true,
  },
  {
    id: 'demo-s01e02',
    title: 'Ecos do Vazio',
    season: 1,
    episodeNumber: 2,
    description: 'Com os sistemas de navegação danificados por uma tempestade de radiação cósmica, a equipe deve tomar uma decisão arriscada.',
    duration: 634,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    fileName: 'S01E02_Ecos_do_Vazio.mp4',
    fileSize: 172000000,
    fileType: 'video/mp4',
    createdAt: Date.now() - 86400000 * 2,
    watched: false,
  },
  {
    id: 'demo-s01e03',
    title: 'O Portal Proibido',
    season: 1,
    episodeNumber: 3,
    description: 'Uma anomalia gravitacional revela uma estrutura alienígena antiga em rota de colisão com a estação espacial.',
    duration: 720,
    thumbnailUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    fileName: 'S01E03_O_Portal_Proibido.mp4',
    fileSize: 85000000,
    fileType: 'video/mp4',
    createdAt: Date.now() - 86400000,
    watched: false,
  },
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(EPISODES_STORE)) {
        const episodeStore = db.createObjectStore(EPISODES_STORE, { keyPath: 'id' });
        episodeStore.createIndex('season', 'season', { unique: false });
        episodeStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllEpisodes(): Promise<Episode[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPISODES_STORE, 'readonly');
    const store = tx.objectStore(EPISODES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const episodes: Episode[] = request.result || [];
      // If store is brand new, seed with demo episodes
      if (episodes.length === 0) {
        initDefaultEpisodes().then(resolve).catch(reject);
        return;
      }
      // Sort by season ascending, then episodeNumber ascending
      episodes.sort((a, b) => {
        if (a.season !== b.season) return a.season - b.season;
        return a.episodeNumber - b.episodeNumber;
      });
      resolve(episodes);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveEpisode(episode: Episode): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPISODES_STORE, 'readwrite');
    const store = tx.objectStore(EPISODES_STORE);
    const request = store.put(episode);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteEpisode(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPISODES_STORE, 'readwrite');
    const store = tx.objectStore(EPISODES_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSeriesInfo(): Promise<SeriesInfo> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readonly');
    const store = tx.objectStore(SETTINGS_STORE);
    const request = store.get('series_info');

    request.onsuccess = () => {
      if (request.result && request.result.value) {
        resolve(request.result.value);
      } else {
        // Return default
        resolve(DEFAULT_SERIES_INFO);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveSeriesInfo(info: SeriesInfo): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    const store = tx.objectStore(SETTINGS_STORE);
    const request = store.put({ key: 'series_info', value: info });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function initDefaultEpisodes(): Promise<Episode[]> {
  const db = await openDB();
  const tx = db.transaction(EPISODES_STORE, 'readwrite');
  const store = tx.objectStore(EPISODES_STORE);

  for (const ep of INITIAL_DEMO_EPISODES) {
    store.put(ep);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      resolve(INITIAL_DEMO_EPISODES as Episode[]);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllEpisodes(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPISODES_STORE, 'readwrite');
    const store = tx.objectStore(EPISODES_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
