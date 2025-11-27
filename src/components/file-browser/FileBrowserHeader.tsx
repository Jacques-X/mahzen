import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, LayoutGrid, List as ListIcon } from 'lucide-react';
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

export const FileBrowserHeader = ({
  currentPath,
  viewMode,
  setViewMode,
  handleGoBack,
  handleGoForward,
  canGoBack,
  canGoForward,
  handleNavigate,
}: FileBrowserHeaderProps) => {
  
  // Debug Log: Check your browser console!
  // If this prints the OLD path when you click a folder, the bug is in MainContent/Parent.
  console.log('Header received path:', currentPath);

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
          {/* KEY PROP ADDED HERE: 
             This forces the input to re-render completely when currentPath changes.
          */}
          <input
            key={currentPath} 
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
};