import React from 'react';
import { Activity, InfoIcon } from 'lucide-react';
import { InfoView } from './InfoView';
import { ActivityView } from '../activity/ActivityView';
import type { FolderStats, DiskStats, SystemStats, RightTabMode } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface RightSidebarProps {
  width: number;
  onStartResize: () => void;
  folderStats: FolderStats | null;
  diskStats: DiskStats | null;
  currentPath: string;
  onRescan: () => void;
  isScanning: boolean;
  systemStats: SystemStats | null;
  onKillProcess: (pid: number) => void;
  activeTab: RightTabMode;
  onTabChange: (tab: RightTabMode) => void;
}

export const RightSidebar = React.memo<RightSidebarProps>(({
  width,
  onStartResize,
  folderStats,
  diskStats,
  currentPath,
  onRescan,
  isScanning,
  systemStats,
  onKillProcess,
  activeTab,
  onTabChange,
}) => {
  const { theme } = useTheme();
  const isRoot = currentPath === '/';

  return (
    <div
      style={{ width, transition: 'width 0.3s ease-in-out' }}
      className="relative flex-shrink-0 flex-col hidden lg:flex group"
    >
      <div
        className="absolute -left-3 top-10 bottom-10 w-6 flex items-center justify-center cursor-col-resize z-50 group-hover:opacity-100 opacity-0 transition-opacity"
        onMouseDown={onStartResize}
      >
        <div className={`w-1 h-12 rounded-full transition-colors shadow-md ${
          theme === 'light' ? 'bg-gray-300 group-hover:bg-blue-400' : 'bg-gray-600 group-hover:bg-blue-600'
        }`}></div>
      </div>

      <div className={`h-full rounded-3xl shadow-xl border flex flex-col p-6 overflow-hidden transition-colors ${
        theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
      }`}>
        {/* Toggle Switch */}
        <div className={`flex p-1 rounded-xl mb-4 shrink-0 transition-colors ${
          theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
        }`}>
          <button
            onClick={() => onTabChange('info')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'info'
                ? (theme === 'light' ? 'bg-white shadow-md text-gray-800' : 'bg-gray-900 shadow-md text-gray-200')
                : (theme === 'light' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300')
            }`}
          >
            <InfoIcon size={12} className={activeTab === 'info' ? 'text-purple-400' : 'text-purple-400'} />
            <span>Info</span>
          </button>
          <button
            onClick={() => onTabChange('activity')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'activity'
                ? (theme === 'light' ? 'bg-white shadow-md text-gray-800' : 'bg-gray-900 shadow-md text-gray-200')
                : (theme === 'light' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300')
            }`}
          >
            <Activity size={12} className={activeTab === 'activity' ? 'text-purple-400' : 'text-purple-400'} />
            <span>Activity</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'info' ? (
            <InfoView
              isRoot={isRoot}
              diskStats={diskStats}
              folderStats={folderStats}
              isScanning={isScanning}
              onRescan={onRescan}
            />
          ) : (
            <ActivityView systemStats={systemStats} onKillProcess={onKillProcess} />
          )}
        </div>
      </div>
    </div>
  );
});
