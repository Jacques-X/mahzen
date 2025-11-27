#!/bin/bash

# File Manager Project Structure Setup Script
# This creates a well-organized React/TypeScript project structure

echo "Creating directory structure..."

# Root directories
mkdir -p src/{components,hooks,types,utils,services,constants,assets}

# Component subdirectories
mkdir -p src/components/{common,layout,file-browser,sidebar,activity}

# Create Type Definitions
cat > src/types/index.ts << 'EOF'
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
EOF

# Create Constants
cat > src/constants/fileTypes.ts << 'EOF'
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'];
export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv'];
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac'];
export const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'md'];

export const CACHE_LIMIT = 100;
export const ICON_CHUNK_SIZE = 5;
EOF

# Create Utility Functions
cat > src/utils/formatters.ts << 'EOF'
export const formatSize = (bytes: number): string => {
  if (bytes >= 1000000000) return (bytes / 1000000000).toFixed(2) + ' GB';
  if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
  return (bytes / 1000).toFixed(0) + ' KB';
};

export const formatMemory = (bytes: number): string => {
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB";
};

export const getDisplayName = (fileName: string, extension: string): string => {
  if (extension.toLowerCase() === 'app') {
    return fileName.replace(/\.app$/i, '');
  }
  return fileName;
};
EOF

cat > src/utils/fileHelpers.ts << 'EOF'
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, DOCUMENT_EXTENSIONS } from '../constants/fileTypes';

export const isPreviewable = (extension: string): boolean => {
  const ext = extension.toLowerCase();
  return ext === 'app' || IMAGE_EXTENSIONS.includes(ext);
};

export const getFileCategory = (extension: string): string => {
  const ext = extension.toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return 'photos';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'videos';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  if (DOCUMENT_EXTENSIONS.includes(ext)) return 'documents';
  if (ext === 'app') return 'apps';
  return 'other';
};
EOF

# Create Services
cat > src/services/tauriService.ts << 'EOF'
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { FileInfo, QuickPaths, FolderStats, DiskStats, SystemStats } from '../types';

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
EOF

# Create Custom Hooks
cat > src/hooks/useResize.ts << 'EOF'
import { useState, useCallback, useEffect } from 'react';

export const useResize = (initialWidth: number, min: number, max: number) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = useCallback(() => setIsResizing(true), []);
  const stopResize = useCallback(() => setIsResizing(false), []);

  const resize = useCallback((e: MouseEvent, fromRight: boolean = false) => {
    if (isResizing) {
      const newWidth = fromRight 
        ? Math.max(min, Math.min(max, window.innerWidth - e.clientX))
        : Math.max(min, Math.min(max, e.clientX));
      setWidth(newWidth);
    }
  }, [isResizing, min, max]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => resize(e);
    const handleMouseUp = () => stopResize();

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resize, stopResize]);

  return { width, setWidth, isResizing, startResize };
};
EOF

cat > src/hooks/useNavigation.ts << 'EOF'
import { useState, useCallback } from 'react';

export const useNavigation = (initialPath: string = '') => {
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigate = useCallback((path: string) => {
    setHistory(prev => {
      const newHist = prev.slice(0, historyIndex + 1);
      newHist.push(path);
      return newHist;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [historyIndex, history]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [historyIndex, history]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;
  const currentPath = history[historyIndex];

  return { navigate, goBack, goForward, canGoBack, canGoForward, currentPath };
};
EOF

cat > src/hooks/useIconCache.ts << 'EOF'
import { useState, useEffect, useRef } from 'react';
import { FileInfo } from '../types';
import { tauriService } from '../services/tauriService';
import { isPreviewable } from '../utils/fileHelpers';
import { CACHE_LIMIT, ICON_CHUNK_SIZE } from '../constants/fileTypes';

export const useIconCache = (files: FileInfo[]) => {
  const [iconCache, setIconCache] = useState<Record<string, string>>({});
  const fetchedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadIcons = async () => {
      const previewableFiles = files.filter(f => {
        if (f.is_dir) return false;
        if (fetchedPaths.current.has(f.path)) return false;
        return isPreviewable(f.extension);
      });

      if (previewableFiles.length === 0) return;
      previewableFiles.forEach(f => fetchedPaths.current.add(f.path));

      for (let i = 0; i < previewableFiles.length; i += ICON_CHUNK_SIZE) {
        const chunk = previewableFiles.slice(i, i + ICON_CHUNK_SIZE);
        const results = await Promise.all(
          chunk.map(async (file) => {
            try {
              const data = await tauriService.getFilePreview(file.path);
              return { path: file.path, data };
            } catch (e) {
              return null;
            }
          })
        );

        setIconCache(prev => {
          const next = { ...prev };
          let added = false;
          results.forEach(res => {
            if (res) {
              next[res.path] = res.data;
              added = true;
            }
          });

          if (Object.keys(next).length > CACHE_LIMIT) {
            const freshCache: Record<string, string> = {};
            results.forEach(res => {
              if (res) freshCache[res.path] = res.data;
            });
            return freshCache;
          }
          return added ? next : prev;
        });
      }
    };

    loadIcons();
  }, [files]);

  return iconCache;
};
EOF

# Create Common Components
cat > src/components/common/FileIcon.tsx << 'EOF'
import React from 'react';
import { LayoutGrid, ImageIcon, Video, Music, FileText, File } from 'lucide-react';
import { FileInfo } from '../../types';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, DOCUMENT_EXTENSIONS } from '../../constants/fileTypes';

interface FileIconProps {
  file: FileInfo;
  size: number;
  iconData?: string | null;
}

export const FileIcon = React.memo<FileIconProps>(({ file, size, iconData }) => {
  if (file.is_dir) {
    return <img src="/kaxxa.png" alt="Folder" style={{ width: size, height: size, objectFit: 'contain' }} />;
  }

  if (iconData) {
    return <img src={`data:image/png;base64,${iconData}`} alt={file.name} style={{ width: size, height: size, objectFit: 'contain' }} />;
  }

  const e = file.extension.toLowerCase();

  if (e === 'app') return <LayoutGrid size={size} className="text-gray-700" />;
  if (IMAGE_EXTENSIONS.includes(e)) return <ImageIcon size={size} className="text-purple-500" />;
  if (VIDEO_EXTENSIONS.includes(e)) return <Video size={size} className="text-red-500" />;
  if (AUDIO_EXTENSIONS.includes(e)) return <Music size={size} className="text-pink-500" />;
  if (DOCUMENT_EXTENSIONS.includes(e)) return <FileText size={size} className="text-blue-500" />;

  return <File size={size} className="text-gray-400" />;
});
EOF

cat > src/components/common/NavItem.tsx << 'EOF'
import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavItem = React.memo<NavItemProps>(({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group mb-0.5 ${
      active ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`}
  >
    <div className="flex items-center space-x-3">
      <span className={active ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}>{icon}</span>
      <span className={`text-sm font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </div>
  </div>
));
EOF

cat > src/components/common/WindowControls.tsx << 'EOF'
import React from 'react';
import { tauriService } from '../../services/tauriService';

export const WindowControls: React.FC = () => {
  const handleClose = async () => {
    try {
      await tauriService.window.close();
    } catch (e) {
      console.error('Failed to close window', e);
    }
  };

  const handleMinimize = async () => {
    try {
      await tauriService.window.minimize();
    } catch (e) {
      console.error('Failed to minimize window', e);
    }
  };

  const handleMaximize = async () => {
    try {
      await tauriService.window.toggleMaximize();
    } catch (e) {
      console.error('Failed to maximize window', e);
    }
  };

  return (
    <div data-tauri-drag-region className="px-5 pt-5 pb-2 flex items-center space-x-2 select-none">
      <div
        onClick={handleClose}
        className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] hover:bg-[#FF5F57]/80 cursor-pointer shadow-sm"
      />
      <div
        onClick={handleMinimize}
        className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:bg-[#FFBD2E]/80 cursor-pointer shadow-sm"
      />
      <div
        onClick={handleMaximize}
        className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] hover:bg-[#28C840]/80 cursor-pointer shadow-sm"
      />
    </div>
  );
};
EOF

# Create File Browser Components
cat > src/components/file-browser/FileBrowserHeader.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, LayoutGrid, List as ListIcon } from 'lucide-react';
import { ViewMode } from '../../types';

interface FileBrowserHeaderProps {
  currentPath: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  handleGoBack: () => void;
  handleGoForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  handleNavigate: (path: string) => void;
}

export const FileBrowserHeader = React.memo<FileBrowserHeaderProps>(({
  currentPath,
  viewMode,
  setViewMode,
  handleGoBack,
  handleGoForward,
  canGoBack,
  canGoForward,
  handleNavigate,
}) => {
  const [pathInput, setPathInput] = useState(currentPath);

  useEffect(() => {
    setPathInput(currentPath || 'Home');
  }, [currentPath]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = pathInput === 'Home' ? '' : pathInput;
      handleNavigate(target);
    }
  };

  return (
    <div data-tauri-drag-region className="h-20 flex items-center justify-between px-6 bg-white border-b border-gray-100">
      <div className="relative flex-1 mr-4 flex items-center space-x-2">
        <div className="flex items-center space-x-1 mr-2">
          <button
            onClick={handleGoBack}
            disabled={!canGoBack}
            className={`p-2 rounded-full transition-colors ${
              canGoBack ? 'hover:bg-gray-100 text-gray-500' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleGoForward}
            disabled={!canGoForward}
            className={`p-2 rounded-full transition-colors ${
              canGoForward ? 'hover:bg-gray-100 text-gray-500' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter path..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:outline-none text-gray-600 font-medium focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="List View"
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
});
EOF

cat > src/components/file-browser/FileGrid.tsx << 'EOF'
import React from 'react';
import { FileInfo } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { getDisplayName } from '../../utils/formatters';

interface FileGridProps {
  files: FileInfo[];
  handleNavigate: (path: string) => void;
  handleOpenFile: (path: string) => void;
  iconCache: Record<string, string>;
}

export const FileGrid = React.memo<FileGridProps>(({ files, handleNavigate, handleOpenFile, iconCache }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10">
    {files.map((file: FileInfo) => (
      <div
        key={file.path}
        onClick={() => file.is_dir && handleNavigate(file.path)}
        onDoubleClick={() => !file.is_dir && handleOpenFile(file.path)}
        className="group flex flex-col items-center p-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all cursor-pointer"
        title={file.name}
      >
        <div className="w-12 h-12 mb-2 flex items-center justify-center transition-transform group-hover:scale-105">
          <FileIcon file={file} size={48} iconData={iconCache[file.path]} />
        </div>
        <span className="text-xs text-center font-medium text-gray-700 line-clamp-2 break-words w-full px-1 leading-tight">
          {getDisplayName(file.name, file.extension)}
        </span>
        <span className="text-[10px] text-gray-400 mt-0.5">
          {file.is_dir ? '' : (file.size / 1024).toFixed(0) + ' KB'}
        </span>
      </div>
    ))}
  </div>
));
EOF

cat > src/components/file-browser/FileList.tsx << 'EOF'
import React from 'react';
import { MoreVertical } from 'lucide-react';
import { FileInfo } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { getDisplayName } from '../../utils/formatters';

interface FileListProps {
  files: FileInfo[];
  handleNavigate: (path: string) => void;
  handleOpenFile: (path: string) => void;
  iconCache: Record<string, string>;
}

export const FileList = React.memo<FileListProps>(({ files, handleNavigate, handleOpenFile, iconCache }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
    <table className="w-full text-left">
      <thead className="text-xs text-gray-400 font-medium bg-gray-50/80 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm">
        <tr>
          <th className="py-3 pl-6 font-normal w-1/2">Name</th>
          <th className="py-3 font-normal hidden sm:table-cell">Size</th>
          <th className="py-3 font-normal hidden md:table-cell">Modified</th>
          <th className="py-3 pr-6"></th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {files.map((file: FileInfo) => (
          <tr
            key={file.path}
            onClick={() => file.is_dir && handleNavigate(file.path)}
            onDoubleClick={() => !file.is_dir && handleOpenFile(file.path)}
            className="hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-none cursor-pointer"
          >
            <td className="py-2 pl-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <FileIcon file={file} size={20} iconData={iconCache[file.path]} />
                </div>
                <span className="font-medium text-gray-700 truncate max-w-[300px]">
                  {getDisplayName(file.name, file.extension)}
                </span>
              </div>
            </td>
            <td className="py-2 hidden sm:table-cell text-xs text-gray-500">
              {file.is_dir ? '--' : (file.size / 1024).toFixed(1) + ' KB'}
            </td>
            <td className="py-2 text-gray-500 text-xs hidden md:table-cell">
              {new Date(file.last_modified * 1000).toLocaleDateString()}
            </td>
            <td className="py-2 pr-6 text-right">
              <MoreVertical size={16} className="text-gray-300 cursor-pointer group-hover:text-gray-500 inline" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));
EOF

# Create Sidebar Components (continued in next part due to length...)

echo "
✅ Directory structure created successfully!

📁 Project Structure:
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components (sidebars)
│   ├── file-browser/    # File browsing components
│   ├── sidebar/         # Sidebar-specific components
│   └── activity/        # Activity monitor components
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── services/            # External service integrations
├── constants/           # App constants
└── assets/              # Static assets

Next steps:
1. Continue creating remaining component files
2. Update imports in your main App.tsx
3. Ensure all dependencies are installed
"
EOF

chmod +x setup-structure.sh

echo "✅ Setup script created! Run with: bash setup-structure.sh"