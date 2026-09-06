import { Episode, Series, SeriesInfo } from '../types';
import {
  DEFAULT_SERIES_INFO,
  fetchAllSeries,
  saveSeriesToServer,
  deleteSeriesFromServer,
  fetchAllEpisodes,
  saveEpisodeToServer,
  deleteEpisodeFromServer,
  resetServerData,
} from './api';

export { DEFAULT_SERIES_INFO };

export async function getAllSeries(): Promise<Series[]> {
  return await fetchAllSeries();
}

export async function saveSeries(series: Series): Promise<Series> {
  return await saveSeriesToServer(series);
}

export async function deleteSeries(seriesId: string): Promise<void> {
  await deleteSeriesFromServer(seriesId);
}

export async function getAllEpisodes(seriesId?: string): Promise<Episode[]> {
  return await fetchAllEpisodes(seriesId);
}

export async function saveEpisode(episode: Episode): Promise<void> {
  await saveEpisodeToServer(episode);
}

export async function deleteEpisode(id: string): Promise<void> {
  await deleteEpisodeFromServer(id);
}

export async function getSeriesInfo(): Promise<SeriesInfo> {
  const seriesList = await fetchAllSeries();
  return seriesList[0] || DEFAULT_SERIES_INFO;
}

export async function saveSeriesInfo(info: SeriesInfo): Promise<void> {
  await saveSeriesToServer(info);
}

export async function clearAllEpisodes(): Promise<void> {
  await resetServerData();
}
