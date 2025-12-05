import React from 'react';
import { FileBrowserHeader } from '../file-browser/FileBrowserHeader';
import { FileGrid } from '../file-browser/FileGrid';
import { FileList } from '../file-browser/FileList';
import { SettingsView } from '../settings/SettingsView';
import type { FileInfo, ViewMode } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MainContentProps {
  currentPath: string;
  files: FileInfo[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  handleGoBack: () => void;
  handleGoForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  handleNavigate: (path: string) => void;
  handleOpenFile: (path: string) => void;
  iconCache: Record<string, string>;
  refreshFiles: () => void; // Added refreshFiles prop
}

export const MainContent = React.memo(({
  currentPath,
  files,
  viewMode,
  setViewMode,
  handleGoBack,
  handleGoForward,
  canGoBack,
  canGoForward,
  handleNavigate,
  handleOpenFile,
  iconCache,
  refreshFiles,
}: MainContentProps) => {
  const { theme } = useTheme();
  
  // DEBUG: Check if MainContent is receiving the update
  console.log("MainContent Path:", currentPath);

  // Render settings view
  if (currentPath === '/settings') {
    return (
      <div className="flex-1 min-w-0">
        <SettingsView />
      </div>
    );
  }

  return (
    <div className={`flex-1 min-w-0 rounded-3xl shadow-xl border flex flex-col overflow-hidden relative transition-colors ${
      theme === 'light' ? 'bg-[#F9FAFB] border-gray-200/60' : 'bg-gray-900 border-gray-700/60'
    }`}>
      <FileBrowserHeader
        currentPath={currentPath}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleGoBack={handleGoBack}
        handleGoForward={handleGoForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        handleNavigate={handleNavigate}
      />

      <div className={`flex-1 overflow-y-auto px-6 pb-6 pt-6 custom-scrollbar transition-colors ${
        theme === 'light' ? '' : 'bg-gray-900'
      }`}>
        {files.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center transition-colors ${
            theme === 'light' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p className="text-sm">This folder is empty</p>
          </div>
        ) : viewMode === 'grid' ? (
          <FileGrid
            files={files}
            handleNavigate={handleNavigate}
            handleOpenFile={handleOpenFile}
            iconCache={iconCache}
            refreshFiles={refreshFiles}
          />
        ) : (
          <FileList
            files={files}
            handleNavigate={handleNavigate}
            handleOpenFile={handleOpenFile}
            iconCache={iconCache}
            refreshFiles={refreshFiles}
          />
        )}
      </div>
    </div>
  );
});

MainContent.displayName = 'MainContent';
