import React from 'react';
import { Activity } from 'lucide-react';
import { InfoView } from './InfoView';
import { ActivityView } from '../activity/ActivityView';
import type { FolderStats, DiskStats, SystemStats, RightTabMode } from '../../types';

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
        <div className="w-1 h-12 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors shadow-sm"></div>
      </div>

      <div className="bg-white h-full rounded-3xl shadow-sm border border-gray-100 flex flex-col p-6 overflow-hidden">
        {/* Toggle Switch */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4 shrink-0">
          <button
            onClick={() => onTabChange('info')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'info' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>Info</span>
          </button>
          <button
            onClick={() => onTabChange('activity')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'activity' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Activity size={12} className={activeTab === 'activity' ? 'text-purple-500' : ''} />
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
