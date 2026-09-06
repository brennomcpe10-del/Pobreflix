import { Series, Episode } from '../types';

export const DEFAULT_SERIES_INFO: Series = {
  id: 'series-cronicas-infinito',
  title: 'Crônicas do Infinito',
  synopsis: 'Em um mundo onde a tecnologia e o mistério se entrelaçam, uma equipe de exploradores desafia os limites do espaço e do tempo em busca de respostas sobre o passado esquecido da humanidade.',
  genre: 'Ficção Científica • Aventura • Mistério',
  year: '2025',
  bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
  rating: '14+',
  createdAt: Date.now(),
};

/**
 * Busca todas as séries salvas no servidor compartilhado.
 * Sincronizado para todos os celulares e computadores.
 */
export async function fetchAllSeries(): Promise<Series[]> {
  try {
    const res = await fetch('/api/series');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Series[] = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return [DEFAULT_SERIES_INFO];
  } catch (err) {
    console.warn('Servidor offline ou inicializando, usando série padrão:', err);
    return [DEFAULT_SERIES_INFO];
  }
}

/**
 * Salva ou atualiza uma série no servidor para que todos os aparelhos vejam.
 */
export async function saveSeriesToServer(series: Series): Promise<Series> {
  const res = await fetch('/api/series', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(series),
  });
  if (!res.ok) {
    throw new Error(`Falha ao salvar série (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Exclui uma série e seus episódios no servidor.
 */
export async function deleteSeriesFromServer(seriesId: string): Promise<void> {
  const res = await fetch(`/api/series/${encodeURIComponent(seriesId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Falha ao excluir série (HTTP ${res.status})`);
  }
}

/**
 * Busca todos os episódios do servidor. Pode filtrar por seriesId.
 */
export async function fetchAllEpisodes(seriesId?: string): Promise<Episode[]> {
  try {
    const url = seriesId ? `/api/episodes?seriesId=${encodeURIComponent(seriesId)}` : '/api/episodes';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Episode[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Erro ao carregar episódios do servidor:', err);
    return [];
  }
}

/**
 * Salva um episódio no servidor.
 */
export async function saveEpisodeToServer(episode: Episode): Promise<Episode> {
  const res = await fetch('/api/episodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(episode),
  });
  if (!res.ok) {
    throw new Error(`Falha ao salvar episódio (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Remove um episódio do servidor.
 */
export async function deleteEpisodeFromServer(episodeId: string): Promise<void> {
  const res = await fetch(`/api/episodes/${encodeURIComponent(episodeId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Falha ao excluir episódio (HTTP ${res.status})`);
  }
}

/**
 * Envia um arquivo de vídeo ou imagem para o armazenamento compartilhado do servidor.
 * Utiliza upload fragmentado (chunks de 3MB) para garantir que arquivos de qualquer tamanho (50MB, 200MB, 1GB+)
 * passem com sucesso sem atingir os limites de proxy reverso (HTTP 413) e com reconexão automática.
 * Retorna a URL pública `/uploads/...` acessível por qualquer celular ou PC.
 */
export async function uploadMediaFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; fileName: string; fileSize: number; fileType: string }> {
  const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB por pedaço
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  const uploadId = `upl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let finalResult: { url: string; fileName: string; fileSize: number; fileType: string } | null = null;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunkBlob = file.slice(start, end);

    let attempts = 0;
    let success = false;
    let lastError: Error | null = null;

    while (attempts < 3 && !success) {
      attempts++;
      try {
        const result = await uploadSingleChunk(
          chunkBlob,
          uploadId,
          chunkIndex,
          totalChunks,
          file.name,
          file.size,
          file.type || 'video/mp4',
          (chunkLoaded, chunkTotal) => {
            if (onProgress) {
              const uploadedBytes = start + chunkLoaded;
              const totalBytes = file.size;
              const percent = Math.min(99, Math.round((uploadedBytes / totalBytes) * 100));
              onProgress(percent);
            }
          }
        );

        if (chunkIndex === totalChunks - 1 && result?.url) {
          finalResult = result;
          if (onProgress) onProgress(100);
        }
        success = true;
      } catch (err: any) {
        lastError = err;
        // Wait before retrying
        await new Promise((r) => setTimeout(r, 600 * attempts));
      }
    }

    if (!success) {
      throw lastError || new Error(`Falha ao enviar pedaço ${chunkIndex + 1} de ${totalChunks}`);
    }
  }

  if (!finalResult?.url) {
    throw new Error('Servidor não retornou a URL pública do vídeo');
  }

  return finalResult;
}

/**
 * Envia um único pedaço de vídeo para o endpoint /api/upload-chunk
 */
function uploadSingleChunk(
  chunk: Blob,
  uploadId: string,
  chunkIndex: number,
  totalChunks: number,
  fileName: string,
  fileSize: number,
  fileType: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<{ url: string; fileName: string; fileSize: number; fileType: string } | null> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', fileName);
    formData.append('fileSize', fileSize.toString());
    formData.append('fileType', fileType);

    if (onProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded, e.total);
        }
      });
    }

    xhr.open('POST', '/api/upload-chunk');

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res);
        } catch {
          reject(new Error('Resposta inválida do servidor de upload'));
        }
      } else {
        reject(new Error(`Erro ao enviar pedaço do vídeo: HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Falha de conexão com o servidor de upload'));
    };

    xhr.send(formData);
  });
}

/**
 * Restaura dados de exemplo no servidor compartilhado.
 */
export async function resetServerData(): Promise<{ series: Series[]; episodes: Episode[] }> {
  const res = await fetch('/api/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Falha ao restaurar dados padrão');
  return await res.json();
}
