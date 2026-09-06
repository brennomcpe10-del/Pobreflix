export interface Episode {
  id: string;
  title: string;
  season: number;
  episodeNumber: number;
  description: string;
  duration?: number; // duration in seconds
  thumbnailUrl?: string; // base64 or url
  videoBlob?: Blob; // stored in IndexedDB for offline & direct downloads
  videoUrl?: string; // direct web stream/download URL
  fileName?: string;
  fileSize?: number; // in bytes
  fileType?: string; // mime type
  createdAt: number;
  watched?: boolean;
}

export interface SeriesInfo {
  title: string;
  synopsis: string;
  genre: string;
  year: string;
  bannerUrl?: string;
  rating?: string;
}
