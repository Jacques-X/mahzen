import React, { useMemo } from 'react';
import { RefreshCw, HardDrive, Cloud, FileCode, Image, Play, Volume2, Zap, Archive } from 'lucide-react';
import type { DiskStats, FolderStats } from '../../types';
import { formatSize } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface InfoViewProps {
  isRoot: boolean;
  diskStats: DiskStats | null;
  folderStats: FolderStats | null;
  isScanning: boolean;
  onRescan: () => void;
}

export const InfoView: React.FC<InfoViewProps> = ({ isRoot, diskStats, folderStats, isScanning, onRescan }) => {
  const { theme } = useTheme();
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
      { label: 'Documents', size: b.documents, sizeStr: formatSize(b.documents), color: 'bg-blue-500', icon: FileCode },
      { label: 'Photos', size: b.photos, sizeStr: formatSize(b.photos), color: 'bg-purple-500', icon: Image },
      { label: 'Videos', size: b.videos, sizeStr: formatSize(b.videos), color: 'bg-red-500', icon: Play },
      { label: 'Audio', size: b.audio, sizeStr: formatSize(b.audio), color: 'bg-pink-500', icon: Volume2 },
      { label: 'Applications', size: b.apps, sizeStr: formatSize(b.apps), color: 'bg-gray-700', icon: Zap },
      { label: 'Archives', size: b.archives, sizeStr: formatSize(b.archives), color: 'bg-amber-500', icon: Archive },
      { label: 'Other', size: b.other, sizeStr: formatSize(b.other), color: 'bg-yellow-500', icon: Cloud },
    ].filter((i) => i.size > 0);
  }, [folderStats, diskStats, isRoot]);

  const totalGraphSize = isRoot && diskStats ? diskStats.total_bytes : folderStats ? folderStats.total_size : 0;

  const getColorHex = (color: string): string => {
    switch (color) {
      case 'bg-blue-500': return '#3b82f6';
      case 'bg-purple-500': return '#C365F7';
      case 'bg-red-500': return '#ef4444';
      case 'bg-pink-500': return '#ec4899';
      case 'bg-gray-700': return '#374151';
      case 'bg-amber-500': return '#f59e0b';
      case 'bg-green-500': return '#22c55e';
      case 'bg-yellow-500': return '#eab308';
      default: return '#9ca3af';
    }
  };

  const describeArc = (radius: number, startAngle: number, endAngle: number) => {
    const gapAngle = 2; // 2 degree gap between segments
    const adjustedEnd = endAngle - gapAngle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (adjustedEnd * Math.PI) / 180;
    
    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);
    
    const largeArcFlag = adjustedEnd - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  const segments = useMemo(() => {
    if (totalGraphSize === 0) return [];
    let currentAngle = 180; // Start at left (180°)
    return breakdown.map((item: any) => {
      const percentage = item.size / totalGraphSize;
      const angleSpan = percentage * 180; // Only 180° for semicircle
      const nextAngle = currentAngle + angleSpan;
      const segment = {
        ...item,
        path: describeArc(40, currentAngle, nextAngle),
        percentage: (percentage * 100).toFixed(1),
        colorHex: getColorHex(item.color),
      };
      currentAngle = nextAngle;
      return segment;
    });
  }, [breakdown, totalGraphSize]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className={`text-sm font-semibold transition-colors ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-200'
        }`}>{isRoot ? 'Disk Usage' : 'Folder Details'}</h3>
        <button
          onClick={onRescan}
          disabled={isScanning}
          className={`p-2 rounded-lg transition-all ${isScanning 
            ? (theme === 'light' ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-700 cursor-not-allowed') 
            : (theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700')
          }`}
          title="Rescan"
        >
          <RefreshCw size={16} className={`text-gray-500 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6 flex-shrink-0">
        <div className="relative w-40 h-24 mb-3 flex justify-center items-start">
          <svg viewBox="0 0 100 50" className="w-full h-full" style={{ overflow: 'visible' }}>
            {segments.map((seg: any, i: number) => (
              <path
                key={i}
                d={seg.path}
                fill="none"
                stroke={seg.colorHex}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-700 ease-out"
              />
            ))}
          </svg>
        </div>
        <div className={`text-2xl font-bold transition-colors ${
          theme === 'light' ? 'text-gray-800' : 'text-white'
        }`}>{formatSize(totalGraphSize)}</div>
        <div className={`text-xs transition-colors ${
          theme === 'light' ? 'text-gray-400' : 'text-gray-500'
        }`}>Total Size</div>
        {!isRoot && (
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <div className={`text-base font-bold transition-colors ${
                theme === 'light' ? 'text-purple-500' : 'text-purple-500'
              }`}>{folderStats ? folderStats.file_count : 0}</div>
              <div className={`text-[10px] transition-colors ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`}>Files</div>
            </div>
            <div className={`w-px h-6 transition-colors ${
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-600'
            }`}></div>
            <div className="text-center">
              <div className={`text-base font-bold transition-colors ${
                theme === 'light' ? 'text-blue-600' : 'text-blue-400'
              }`}>{folderStats ? folderStats.folder_count : 0}</div>
              <div className={`text-[10px] transition-colors ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`}>Folders</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {breakdown.length === 0 ? (
          <div className={`text-center text-xs mt-4 transition-colors ${
            theme === 'light' ? 'text-gray-400' : 'text-gray-500'
          }`}>{isScanning ? 'Scanning...' : 'No data available'}</div>
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
                    <div className={`text-xs font-semibold transition-colors ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                    }`}>{item.label}</div>
                    <div className={`text-[9px] transition-colors ${
                      theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                    }`}>{segment ? segment.percentage : '0'}%</div>
                  </div>
                </div>
                <div className={`text-xs font-bold transition-colors ${
                  theme === 'light' ? 'text-purple-500' : 'text-purple-500'
                }`}>{item.sizeStr}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
