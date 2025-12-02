import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, List, MapPin } from 'lucide-react';
import type { ViewMode } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(currentPath);

  // Update inputValue when currentPath changes from outside (e.g., sidebar navigation)
  useEffect(() => {
    setInputValue(currentPath);
  }, [currentPath]);

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNavigate(inputValue);
      e.currentTarget.blur(); // Optional: unfocus input after navigation
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div data-tauri-drag-region className={`h-20 flex items-center justify-between px-6 border-b transition-colors ${
      theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
    }`}>
      <div className="relative flex-1 mr-4 flex items-center space-x-2">
        <button
          onClick={handleGoBack}
          disabled={!canGoBack}
          className={`p-2 rounded-full transition-colors ${
            canGoBack
              ? (theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-700 text-gray-400')
              : (theme === 'light' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 cursor-not-allowed')
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleGoForward}
          disabled={!canGoForward}
          className={`p-2 rounded-full transition-colors ${
            canGoForward
              ? (theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-700 text-gray-400')
              : (theme === 'light' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 cursor-not-allowed')
          }`}
        >
          <ChevronRight size={20} />
        </button>
        <div className="flex-1 relative">
          <MapPin className={`absolute left-3 top-2.5 transition-colors ${
            theme === 'light' ? 'text-gray-400' : 'text-gray-500'
          }`} size={16} />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            placeholder="Enter path..."
            className={`w-full pl-9 pr-4 py-2 border-none rounded-full text-sm focus:outline-none font-medium focus:ring-2 focus:ring-purple-100 transition-all ${
              theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-gray-700 text-gray-300'
            }`}
          />
        </div>
      </div>
      <div className="flex items-center">
        <div className={`flex p-1 rounded-lg transition-colors ${
          theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
        }`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid'
                ? (theme === 'light' ? 'bg-white shadow-sm text-gray-800' : 'bg-gray-900 shadow-sm text-gray-200')
                : (theme === 'light' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300')
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list'
                ? (theme === 'light' ? 'bg-white shadow-sm text-gray-800' : 'bg-gray-900 shadow-sm text-gray-200')
                : (theme === 'light' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300')
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});
