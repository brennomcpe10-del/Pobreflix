import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

interface Series {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  year: string;
  bannerUrl?: string;
  rating?: string;
  createdAt: number;
}

interface Episode {
  id: string;
  seriesId: string;
  title: string;
  season: number;
  episodeNumber: number;
  description: string;
  duration?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: number;
  watched?: boolean;
}

interface DatabaseSchema {
  series: Series[];
  episodes: Episode[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Default initial data with multiple series and episodes
const DEFAULT_SERIES: Series[] = [
  {
    id: 'series-cronicas-infinito',
    title: 'Crônicas do Infinito',
    synopsis: 'Em um mundo onde a tecnologia e o mistério se entrelaçam, uma equipe de exploradores desafia os limites do espaço e do tempo em busca de respostas sobre o passado esquecido da humanidade.',
    genre: 'Ficção Científica • Aventura • Mistério',
    year: '2025',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    rating: '14+',
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'series-cyber-neon',
    title: 'Cyber Neon: Nova Era',
    synopsis: 'Nas sombras de uma megalópole futurista dominada por megacorporações e inteligências artificiais rebeldes, uma equipe de especialistas luta pela liberdade e pela verdade oculta no ciberespaço.',
    genre: 'Cyberpunk • Ação • Suspense',
    year: '2026',
    bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920&auto=format&fit=crop',
    rating: '16+',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'series-reinos-perdidos',
    title: 'Reinos Perdidos: A Era do Dragão',
    synopsis: 'Após séculos de paz, as antigas runas mágicas despertam. Jovens guerreiros e magos partem em uma perigosa expedição através de montanhas místicas para deter a ruína do continente.',
    genre: 'Fantasia Épica • Aventura • Magia',
    year: '2024',
    bannerUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920&auto=format&fit=crop',
    rating: '12+',
    createdAt: Date.now() - 86400000 * 5,
  },
];

const DEFAULT_EPISODES: Episode[] = [
  // Série 1: Crônicas do Infinito
  {
    id: 'ep-infinito-s01e01',
    seriesId: 'series-cronicas-infinito',
    title: 'O Primeiro Contato',
    season: 1,
    episodeNumber: 1,
    description: 'Após detectar uma transmissão misteriosa nas profundezas da órbita lunar, a tripulação da nave Horizon inicia uma jornada sem volta.',
    duration: 596,
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    fileName: 'S01E01_O_Primeiro_Contato.mp4',
    fileSize: 158000000,
    fileType: 'video/mp4',
    createdAt: Date.now() - 86400000 * 12,
    watched: true,
  },
  {
    id: 'ep-infinito-s01e02',
    seriesId: 'series-cronicas-infinito',
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
    createdAt: Date.now() - 86400000 * 10,
    watched: false,
  },
  {
    id: 'ep-infinito-s01e03',
    seriesId: 'series-cronicas-infinito',
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
    createdAt: Date.now() - 86400000 * 8,
    watched: false,
  },

  // Série 2: Cyber Neon
  {
    id: 'ep-cyber-s01e01',
    seriesId: 'series-cyber-neon',
    title: 'Rede Subterrânea',
    season: 1,
    episodeNumber: 1,
    description: 'Um especialista em dados é contratado para descriptografar um arquivo proibido que pode derrubar o conselho da megacidade.',
    duration: 540,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    fileName: 'S01E01_Rede_Subterranea.mp4',
    fileSize: 198000000,
    fileType: 'video/mp4',
    createdAt: Date.now() - 86400000 * 7,
    watched: false,
  },
  {
    id: 'ep-cyber-s01e02',
    seriesId: 'series-cyber-neon',
    title: 'Fantasma no Código',
    season: 1,
    episodeNumber: 2,
    description: 'Drones de segurança cercam o esconderijo do grupo após uma transmissão clandestina revelar segredos governamentais.',
    duration: 610,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    fileName: 'S01E02_Fantasma_no_Codigo.mp4',
    fileSize: 142000000,
    fileType: 'video/mp4',
    createdAt: Date.now() - 86400000 * 5,
    watched: false,
  },

  // Série 3: Reinos Perdidos
  {
    id: 'ep-reinos-s01e01',
    seriesId: 'series-reinos-perdidos',
    title: 'O Chamado das Runas',
    season: 1,
    episodeNumber: 1,
    description: 'Em uma vila pacífica nas montanhas, uma relíquia ancestral ganha vida própria após séculos adormecida sob o templo.',
    duration: 660,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    fileName: 'S01E01_O_Chamado_das_Runas.mp4',
    fileSize: 165000000,
    fileType: 'video/mp4',
    createdAt: Date.now() - 86400000 * 4,
    watched: false,
  },
];

function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.series) && Array.isArray(parsed.episodes)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler banco db.json, recriando inicial:', err);
  }
  const initial = { series: DEFAULT_SERIES, episodes: DEFAULT_EPISODES };
  writeDatabase(initial);
  return initial;
}

function writeDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar db.json:', err);
  }
}

// Multer storage for uploaded videos and images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    cb(null, `${base}_${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // Suporta arquivos de até 2GB
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static uploads serving with Range header support for video streaming
  app.use('/uploads', express.static(UPLOADS_DIR, {
    acceptRanges: true,
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (filePath.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (filePath.endsWith('.mkv')) {
        res.setHeader('Content-Type', 'video/x-matroska');
      } else if (filePath.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
      }
    },
  }));

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // API: Get all series
  app.get('/api/series', (req, res) => {
    const db = readDatabase();
    res.json(db.series);
  });

  // API: Save or update series
  app.post('/api/series', (req, res) => {
    const newSeries: Series = req.body;
    if (!newSeries || !newSeries.title) {
      res.status(400).json({ error: 'Título da série é obrigatório' });
      return;
    }

    const db = readDatabase();
    if (!newSeries.id) {
      newSeries.id = `series-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    if (!newSeries.createdAt) {
      newSeries.createdAt = Date.now();
    }

    const index = db.series.findIndex((s) => s.id === newSeries.id);
    if (index >= 0) {
      db.series[index] = { ...db.series[index], ...newSeries };
    } else {
      db.series.push(newSeries);
    }

    writeDatabase(db);
    res.json(newSeries);
  });

  // API: Delete series (and all its episodes)
  app.delete('/api/series/:id', (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    db.series = db.series.filter((s) => s.id !== id);
    db.episodes = db.episodes.filter((e) => e.seriesId !== id);
    writeDatabase(db);
    res.json({ success: true, deletedId: id });
  });

  // API: Get all episodes (optional filter by ?seriesId=...)
  app.get('/api/episodes', (req, res) => {
    const { seriesId } = req.query;
    const db = readDatabase();
    let episodes = db.episodes;
    if (seriesId && typeof seriesId === 'string') {
      episodes = episodes.filter((e) => e.seriesId === seriesId);
    }
    // Sort by season and episode number
    episodes.sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.episodeNumber - b.episodeNumber;
    });
    res.json(episodes);
  });

  // API: Save or update episode
  app.post('/api/episodes', (req, res) => {
    const ep: Episode = req.body;
    if (!ep || !ep.title) {
      res.status(400).json({ error: 'Título do episódio é obrigatório' });
      return;
    }

    const db = readDatabase();
    if (!ep.id) {
      ep.id = `ep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    if (!ep.seriesId) {
      ep.seriesId = db.series[0]?.id || 'series-default';
    }
    if (!ep.createdAt) {
      ep.createdAt = Date.now();
    }

    const index = db.episodes.findIndex((e) => e.id === ep.id);
    if (index >= 0) {
      db.episodes[index] = { ...db.episodes[index], ...ep };
    } else {
      db.episodes.push(ep);
    }

    writeDatabase(db);
    res.json(ep);
  });

  // API: Delete episode
  app.delete('/api/episodes/:id', (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    db.episodes = db.episodes.filter((e) => e.id !== id);
    writeDatabase(db);
    res.json({ success: true, deletedId: id });
  });

  // API: Upload video or image file to server storage
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado' });
      return;
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: publicUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    });
  });

  // API: Reset to sample demo series and episodes
  app.post('/api/reset', (req, res) => {
    const resetData = { series: DEFAULT_SERIES, episodes: DEFAULT_EPISODES };
    writeDatabase(resetData);
    res.json(resetData);
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
