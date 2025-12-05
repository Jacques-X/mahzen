import React from 'react';
import {
  Monitor,
  File,
  ArrowBigDownDash,
  SendHorizonal,
  Trash2,
  Cloud,
  LayoutGrid,
  Settings2Icon,
  HardDrive,
} from 'lucide-react';
import { HomeIcon } from 'lucide-react'; 
import type { QuickPaths } from '../../types';
import { WindowControls } from '../common/WindowControls';
import { NavItem } from '../common/NavItem';
import { useTheme } from '../../context/ThemeContext';

interface LeftSidebarProps {
  width: number;
  onStartResize: () => void;
  quickPaths: QuickPaths | null;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const LeftSidebar = React.memo<LeftSidebarProps>(({
  width,
  onStartResize,
  quickPaths,
  onNavigate,
  currentPath,
}) => {
  const { theme } = useTheme();

  return (
    <div style={{ width }} className="relative flex-shrink-0 flex flex-col group">
      <div className={`h-full rounded-3xl shadow-xl flex flex-col border overflow-hidden transition-colors ${
        theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
      }`}>
        <WindowControls />

        <div 
          data-tauri-drag-region 
          className={`mt-6 flex items-center justify-center px-5 pb-4 border-b transition-colors ${
            theme === 'light' ? 'border-gray-50/50' : 'border-gray-700/50'
          }`}
        >
          <img 
            src="/logo v1.svg" 
            className="h-12 w-auto object-contain"
            alt="App Logo"
          />
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {quickPaths && (
            <>
              <NavItem
                  icon={<HomeIcon size={18} />}
                  label="Home"
                  active={currentPath === '/custom-view'}
                  onClick={() => onNavigate('/custom-view')}
              />
              <NavItem
                icon={<HardDrive size={18} />}
                label="Root"
                active={currentPath === '/'}
                onClick={() => onNavigate('/')}
              />
              <NavItem
                icon={<LayoutGrid size={18} />}
                label="Applications"
                active={currentPath === '/Applications'}
                onClick={() => onNavigate('/Applications')}
              />

              <NavItem
                icon={<Cloud size={18} />}
                label="Cloud Storage"
                active={currentPath === quickPaths.home + '/Library/CloudStorage'}
                onClick={() => onNavigate(quickPaths.home + '/Library/CloudStorage')}
              />

              <NavItem
                icon={<Monitor size={18} />}
                label="Desktop"
                active={currentPath === quickPaths.desktop}
                onClick={() => onNavigate(quickPaths.desktop)}
              />
              <NavItem
                icon={<File size={18} />}
                label="Documents"
                active={currentPath === quickPaths.documents}
                onClick={() => onNavigate(quickPaths.documents)}
              />
              <NavItem
                icon={<ArrowBigDownDash size={18} />}
                label="Downloads"
                active={currentPath === quickPaths.downloads}
                onClick={() => onNavigate(quickPaths.downloads)}
              />

              <div className="pt-8 pb-2">
                <NavItem
                  icon={<SendHorizonal size={18} />}
                  label="Airdrop"
                  active={false}
                  onClick={() => onNavigate(quickPaths.downloads)}
                />

                <NavItem
                  icon={<Trash2 size={18} />}
                  label="Bin"
                  active={currentPath === quickPaths.home + '/.Trash'}
                  onClick={() => onNavigate(quickPaths.home + '/.Trash')}
                />
              </div>
            </>
          )}
        </div>

        <div className={`p-3 border-t transition-colors ${
          theme === 'light' ? 'border-gray-50/50 bg-white' : 'border-gray-700/50 bg-gray-800'
        } z-10`}>
          <NavItem
            icon={<Settings2Icon size={18} />}
            label="Settings"
            active={currentPath === '/settings'}
            onClick={() => onNavigate('/settings')}
          />
        </div>
      </div>

      <div
        className="absolute -right-3 top-10 bottom-10 w-6 flex items-center justify-center cursor-col-resize z-50 group-hover:opacity-100 opacity-0 transition-opacity"
        onMouseDown={onStartResize}
      >
        <div className={`w-1 h-12 rounded-full transition-colors shadow-sm ${
          theme === 'light' ? 'bg-gray-300 group-hover:bg-blue-400' : 'bg-gray-600 group-hover:bg-blue-600'
        }`}></div>
      </div>
    </div>
  );
});
