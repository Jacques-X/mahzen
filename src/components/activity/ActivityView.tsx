import React from 'react';
import { Cpu, MemoryStick, Zap, XCircle } from 'lucide-react';
import type { SystemStats } from '../../types';
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
