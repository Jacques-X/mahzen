#!/bin/bash

# Quick fix script - creates ONLY the missing files you need
# Run this in your project root: chmod +x fix-missing.sh && ./fix-missing.sh

echo "🔧 Creating missing component files..."

# Create MainContent component
cat > src/components/layout/MainContent.tsx << 'EOF'
import React from 'react';
import { FileBrowserHeader } from '../file-browser/FileBrowserHeader';
import { FileGrid } from '../file-browser/FileGrid';
import { FileList } from '../file-browser/FileList';
import { FileInfo, ViewMode } from '../../types';

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
EOF

# Create LeftSidebar component
cat > src/components/sidebar/LeftSidebar.tsx << 'EOF'
import React from 'react';
import {
  HomeIcon,
  Monitor,
  File,
  ArrowBigDownDash,
  SendHorizonal,
  Trash2,
  Cloud,
  LayoutGrid,
} from 'lucide-react';
import { QuickPaths } from '../../types';
import { WindowControls } from '../common/WindowControls';
import { NavItem } from '../common/NavItem';

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
  return (
    <div style={{ width }} className="relative flex-shrink-0 flex flex-col group">
      <div className="bg-white h-full rounded-3xl shadow-sm flex flex-col border border-gray-100 overflow-hidden">
        <WindowControls />

        <div data-tauri-drag-region className="h-14 flex items-center px-5 border-b border-gray-50/50">
          <img src="/logo.png" alt="MAĦŻEN" className="h-7 w-auto object-contain" />
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {quickPaths && (
            <>
              <NavItem
                icon={<HomeIcon size={18} />}
                label="Home"
                active={currentPath === quickPaths.home}
                onClick={() => onNavigate(quickPaths.home)}
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
      </div>

      <div
        className="absolute -right-3 top-10 bottom-10 w-6 flex items-center justify-center cursor-col-resize z-50 group-hover:opacity-100 opacity-0 transition-opacity"
        onMouseDown={onStartResize}
      >
        <div className="w-1 h-12 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors shadow-sm"></div>
      </div>
    </div>
  );
});
EOF

# Create RightSidebar component
cat > src/components/sidebar/RightSidebar.tsx << 'EOF'
import React from 'react';
import { Activity } from 'lucide-react';
import { InfoView } from './InfoView';
import { ActivityView } from '../activity/ActivityView';
import { FolderStats, DiskStats, SystemStats, RightTabMode } from '../../types';

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
EOF

# Create InfoView component
cat > src/components/sidebar/InfoView.tsx << 'EOF'
import React, { useMemo } from 'react';
import { RefreshCw, HardDrive, Cloud, FileText, Image as ImageIcon, Video, Music, LayoutGrid, File } from 'lucide-react';
import { DiskStats, FolderStats } from '../../types';
import { formatSize } from '../../utils/formatters';

interface InfoViewProps {
  isRoot: boolean;
  diskStats: DiskStats | null;
  folderStats: FolderStats | null;
  isScanning: boolean;
  onRescan: () => void;
}

export const InfoView: React.FC<InfoViewProps> = ({ isRoot, diskStats, folderStats, isScanning, onRescan }) => {
  const breakdown = useMemo(() => {
    if (isRoot && diskStats) {
      return [
        { label: 'Used Space', size: diskStats.used_bytes, sizeStr: formatSize(diskStats.used_bytes), color: 'bg-gray-700', icon: HardDrive },
        { label: 'Free Space', size: diskStats.free_bytes, sizeStr: formatSize(diskStats.free_bytes), color: 'bg-green-500', icon: Cloud },
      ];
    }

    if (!folderStats || !folderStats.breakdown) return [];

    const b = folderStats.breakdown;
    return [
      { label: 'Documents', size: b.documents, sizeStr: formatSize(b.documents), color: 'bg-blue-500', icon: FileText },
      { label: 'Photos', size: b.photos, sizeStr: formatSize(b.photos), color: 'bg-purple-500', icon: ImageIcon },
      { label: 'Videos', size: b.videos, sizeStr: formatSize(b.videos), color: 'bg-red-500', icon: Video },
      { label: 'Audio', size: b.audio, sizeStr: formatSize(b.audio), color: 'bg-pink-500', icon: Music },
      { label: 'Applications', size: b.apps, sizeStr: formatSize(b.apps), color: 'bg-gray-700', icon: LayoutGrid },
      { label: 'Other', size: b.other, sizeStr: formatSize(b.other), color: 'bg-yellow-500', icon: File },
    ].filter((i) => i.size > 0);
  }, [folderStats, diskStats, isRoot]);

  const totalGraphSize = isRoot && diskStats ? diskStats.total_bytes : folderStats ? folderStats.total_size : 0;

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const startRad = ((startAngle - 180) * Math.PI) / 180;
    const endRad = ((endAngle - 180) * Math.PI) / 180;
    const x1 = x + radius * Math.cos(startRad);
    const y1 = y + radius * Math.sin(startRad);
    const x2 = x + radius * Math.cos(endRad);
    const y2 = y + radius * Math.sin(endRad);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', x1, y1, 'A', radius, radius, 0, largeArcFlag, 1, x2, y2].join(' ');
  };

  const segments = useMemo(() => {
    if (totalGraphSize === 0) return [];
    let currentAngle = 0;
    return breakdown.map((item: any) => {
      const percentage = item.size / totalGraphSize;
      const angleSpan = percentage * 180;
      const segment = {
        ...item,
        path: describeArc(50, 50, 40, currentAngle, currentAngle + angleSpan),
        percentage: (percentage * 100).toFixed(1),
        colorHex:
          item.color === 'bg-blue-500'
            ? '#3b82f6'
            : item.color === 'bg-purple-500'
            ? '#a855f7'
            : item.color === 'bg-red-500'
            ? '#ef4444'
            : item.color === 'bg-pink-500'
            ? '#ec4899'
            : item.color === 'bg-gray-700'
            ? '#374151'
            : item.color === 'bg-green-500'
            ? '#22c55e'
            : item.color === 'bg-yellow-500'
            ? '#eab308'
            : '#9ca3af',
      };
      currentAngle += angleSpan;
      return segment;
    });
  }, [breakdown, totalGraphSize]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700">{isRoot ? 'Disk Usage' : 'Folder Details'}</h3>
        <button
          onClick={onRescan}
          disabled={isScanning}
          className={`p-2 rounded-lg transition-all ${isScanning ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="Rescan"
        >
          <RefreshCw size={16} className={`text-gray-500 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6 flex-shrink-0">
        <div className="relative w-40 h-20 overflow-hidden mb-3 flex justify-center">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            {segments.map((seg: any, i: number) => (
              <path
                key={i}
                d={seg.path}
                fill="none"
                stroke={seg.colorHex}
                strokeWidth="10"
                strokeLinecap="butt"
                className="transition-all duration-700 ease-out"
              />
            ))}
          </svg>
        </div>
        <div className="text-2xl font-bold text-gray-800">{formatSize(totalGraphSize)}</div>
        <div className="text-xs text-gray-400">Total Size</div>
        {!isRoot && (
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <div className="text-base font-bold text-purple-600">{folderStats ? folderStats.file_count : 0}</div>
              <div className="text-[10px] text-gray-400">Files</div>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-base font-bold text-blue-600">{folderStats ? folderStats.folder_count : 0}</div>
              <div className="text-[10px] text-gray-400">Folders</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {breakdown.length === 0 ? (
          <div className="text-center text-gray-400 text-xs mt-4">{isScanning ? 'Scanning...' : 'No data available'}</div>
        ) : (
          breakdown.map((item: any, idx: number) => {
            const segment = segments.find((s) => s.label === item.label);
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg ${item.color} bg-opacity-10 flex items-center justify-center`}>
                    <item.icon size={12} className={item.color.replace('bg-', 'text-')} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700">{item.label}</div>
                    <div className="text-[9px] text-gray-400">{segment ? segment.percentage : '0'}%</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-purple-600">{item.sizeStr}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
EOF

# Create ActivityView component
cat > src/components/activity/ActivityView.tsx << 'EOF'
import React from 'react';
import { Cpu, MemoryStick, Zap, XCircle } from 'lucide-react';
import { SystemStats } from '../../types';
import { formatMemory } from '../../utils/formatters';

interface ActivityViewProps {
  systemStats: SystemStats | null;
  onKillProcess: (pid: number) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ systemStats, onKillProcess }) => {
  if (!systemStats)
    return <div className="text-center text-gray-400 text-sm mt-10">Loading activity...</div>;

  const memPercent = (systemStats.used_memory / systemStats.total_memory) * 100;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex-shrink-0">System Activity</h3>

      {/* CPU Card */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-100 rounded-lg text-red-500">
              <Cpu size={14} />
            </div>
            <span className="text-xs font-medium text-gray-600">CPU Load</span>
          </div>
          <span className="text-sm font-bold text-gray-800">{systemStats.cpu_usage.toFixed(0)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(systemStats.cpu_usage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Memory Card */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-500">
              <MemoryStick size={14} />
            </div>
            <span className="text-xs font-medium text-gray-600">Memory</span>
          </div>
          <span className="text-xs font-bold text-gray-800">
            {formatMemory(systemStats.used_memory)} / {formatMemory(systemStats.total_memory)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${memPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Top Processes Header */}
      <div className="flex-shrink-0 mb-2 flex justify-between items-end px-1">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Processes</h4>
        <span className="text-[10px] text-gray-400">Auto-refreshing</span>
      </div>

      {/* Scrollable Process List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-2 min-h-0">
        <div className="space-y-1 pb-2">
          {systemStats.top_processes.map((proc) => (
            <div
              key={proc.pid}
              className="group flex items-center justify-between p-2 hover:bg-red-50/50 rounded-lg transition-colors border border-transparent hover:border-red-100 relative"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 bg-white border border-gray-100 shadow-sm rounded-md flex items-center justify-center flex-shrink-0 text-gray-500">
                  <Zap size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]" title={proc.name}>
                    {proc.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">PID: {proc.pid}</span>
                </div>
              </div>

              <div className="flex items-center pl-2">
                <div className="text-right flex-shrink-0 mr-3 group-hover:opacity-50 transition-opacity">
                  <div className="text-xs font-bold text-gray-800">{proc.cpu_usage.toFixed(1)}%</div>
                  <div className="text-[9px] text-gray-400">CPU</div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onKillProcess(proc.pid);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-full shadow-sm transition-all"
                  title={`Kill Process ${proc.pid}`}
                >
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
EOF

echo "✅ All missing components created!"
echo ""
echo "Files created:"
echo "  - src/components/layout/MainContent.tsx"
echo "  - src/components/sidebar/LeftSidebar.tsx"
echo "  - src/components/sidebar/RightSidebar.tsx"
echo "  - src/components/sidebar/InfoView.tsx"
echo "  - src/components/activity/ActivityView.tsx"
echo ""
echo "🎉 You should now be able to run your app!"
EOF

chmod +x fix-missing.sh

echo "✅ Created fix-missing.sh - Run it with: ./fix-missing.sh"