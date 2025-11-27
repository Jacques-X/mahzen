import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import type { FileInfo, QuickPaths, FolderStats, DiskStats, SystemStats } from '../types';

export const tauriService = {
  async getQuickPaths(): Promise<QuickPaths> {
    return await invoke<QuickPaths>('get_quick_paths');
  },

  async readDirectory(path: string): Promise<FileInfo[]> {
    return await invoke<FileInfo[]>('read_directory', { path });
  },

  async getFolderStats(path: string): Promise<FolderStats> {
    return await invoke<FolderStats>('get_folder_stats', { path });
  },

  async getDiskStats(): Promise<DiskStats> {
    return await invoke<DiskStats>('get_disk_stats');
  },

  async getSystemStats(): Promise<SystemStats> {
    return await invoke<SystemStats>('get_system_stats');
  },

  async getFilePreview(path: string): Promise<string> {
    return await invoke<string>('get_file_preview', { path });
  },

  async openFile(path: string): Promise<void> {
    await invoke('open_file', { path });
  },

  async killProcess(pid: number): Promise<void> {
    await invoke('kill_process', { pid });
  },

  async clearStatsCache(): Promise<void> {
    await invoke('clear_stats_cache');
  },

  window: {
    async close() {
      const window = getCurrentWindow();
      await window.close();
    },
    async minimize() {
      const window = getCurrentWindow();
      await window.minimize();
    },
    async toggleMaximize() {
      const window = getCurrentWindow();
      await window.toggleMaximize();
    },
  },
};
