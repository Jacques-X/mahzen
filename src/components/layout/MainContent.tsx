import React from 'react';
import { FileBrowserHeader } from '../file-browser/FileBrowserHeader';
import { FileGrid } from '../file-browser/FileGrid';
import { FileList } from '../file-browser/FileList';
import type { FileInfo, ViewMode } from '../../types';

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
}

export const MainContent = React.memo<MainContentProps>(({
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
}) => {
  return (
    <div className="flex-1 min-w-0 bg-[#F9FAFB] rounded-3xl shadow-sm border border-gray-200/60 flex flex-col overflow-hidden relative">
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

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 custom-scrollbar">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p className="text-sm">This folder is empty</p>
          </div>
        ) : viewMode === 'grid' ? (
          <FileGrid
            files={files}
            handleNavigate={handleNavigate}
            handleOpenFile={handleOpenFile}
            iconCache={iconCache}
          />
        ) : (
          <FileList
            files={files}
            handleNavigate={handleNavigate}
            handleOpenFile={handleOpenFile}
            iconCache={iconCache}
          />
        )}
      </div>
    </div>
  );
});
