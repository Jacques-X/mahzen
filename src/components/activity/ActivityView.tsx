import React from 'react';
import { Cpu, MemoryStick, Zap, XCircle } from 'lucide-react';
import type { SystemStats } from '../../types';
import { formatMemory } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface ActivityViewProps {
  systemStats: SystemStats | null;
  onKillProcess: (pid: number) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ systemStats, onKillProcess }) => {
  const { theme } = useTheme();

  if (!systemStats)
    return <div className={`text-center text-sm mt-10 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Loading activity...</div>;

  const memPercent = (systemStats.used_memory / systemStats.total_memory) * 100;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <h3 className={`text-sm font-semibold mb-4 flex-shrink-0 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>System Activity</h3>

      {/* CPU Card */}
      <div className={`rounded-2xl p-4 mb-3 border flex-shrink-0 ${
        theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-gray-700 border-gray-600'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-100 rounded-lg text-red-500">
              <Cpu size={14} />
            </div>
            <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>CPU Load</span>
          </div>
          <span className={`text-sm font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{systemStats.cpu_usage.toFixed(0)}%</span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-600'}`}>
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(systemStats.cpu_usage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Memory Card */}
      <div className={`rounded-2xl p-4 mb-4 border flex-shrink-0 ${
        theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-gray-700 border-gray-600'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-500">
              <MemoryStick size={14} />
            </div>
            <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Memory</span>
          </div>
          <span className={`text-xs font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            {formatMemory(systemStats.used_memory)} / {formatMemory(systemStats.total_memory)}
          </span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-600'}`}>
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${memPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Top Processes Header */}
      <div className="flex-shrink-0 mb-2 flex justify-between items-end px-1">
        <h4 className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Top Processes</h4>
        <span className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Auto-refreshing</span>
      </div>

      {/* Scrollable Process List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-2 min-h-0">
        <div className="space-y-1 pb-2">
          {systemStats.top_processes.map((proc) => (
            <div
              key={proc.pid}
              className={`group flex items-center justify-between p-2 rounded-lg transition-colors border border-transparent relative ${
                theme === 'light'
                  ? 'hover:bg-red-50/50 hover:border-red-100'
                  : 'hover:bg-red-900/20 hover:border-red-800'
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`w-8 h-8 border shadow-sm rounded-md flex items-center justify-center flex-shrink-0 ${
                  theme === 'light' ? 'bg-white border-gray-100 text-gray-500' : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}>
                  <Zap size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-bold truncate max-w-[100px] ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} title={proc.name}>
                    {proc.name}
                  </span>
                  <span className={`text-[10px] font-mono ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>PID: {proc.pid}</span>
                </div>
              </div>

              <div className="flex items-center pl-2">
                <div className={`text-right flex-shrink-0 mr-3 group-hover:opacity-50 transition-opacity ${theme === 'light' ? '' : 'text-white'}`}>
                  <div className={`text-xs font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{proc.cpu_usage.toFixed(1)}%</div>
                  <div className={`text-[9px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>CPU</div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onKillProcess(proc.pid);
                  }}
                  className={`w-8 h-8 flex items-center justify-center border shadow-sm rounded-full transition-all ${
                    theme === 'light'
                      ? 'bg-white border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-700 hover:bg-red-900/20'
                  }`}
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
