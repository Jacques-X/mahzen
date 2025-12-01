export interface FileInfo {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  last_modified: number;
  extension: string;
}

export interface QuickPaths {
  home: string;
  desktop: string;
  documents: string;
  downloads: string;
  movies: string;
  pictures: string;
}

export interface DiskStats {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
}

export interface FolderStats {
  total_size: number;
  file_count: number;
  folder_count: number;
  breakdown: {
    documents: number;
    photos: number;
    videos: number;
    audio: number;
    apps: number;
    archives: number;
    other: number;
  };
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  memory: number;
}

export interface SystemStats {
  cpu_usage: number;
  total_memory: number;
  used_memory: number;
  top_processes: ProcessInfo[];
}

export type ViewMode = 'grid' | 'list';
export type RightTabMode = 'info' | 'activity';