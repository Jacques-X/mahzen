import React, { useMemo } from 'react';
import { RefreshCw, HardDrive, Cloud, FileText, Image as ImageIcon, Video, Music, LayoutGrid, File } from 'lucide-react';
import type { DiskStats, FolderStats } from '../../types';
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
