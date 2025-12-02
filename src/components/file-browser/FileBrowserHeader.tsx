import React from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, List, MapPin } from 'lucide-react';
import type { ViewMode } from '../../types';

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
  return (
    <div data-tauri-drag-region className="h-20 flex items-center justify-between px-6 border-b transition-colors bg-white border-gray-100">
      <div className="relative flex-1 mr-4 flex items-center space-x-2">
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
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={currentPath}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleNavigate((e.target as HTMLInputElement).value);
              }
            }}
            onChange={() => {}} // Controlled component, value is set by state
            readOnly
            placeholder="Enter path..."
            className="w-full pl-9 pr-4 py-2 border-none rounded-full text-sm focus:outline-none font-medium focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50 text-gray-600"
          />
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex p-1 rounded-lg transition-colors bg-gray-100">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});
