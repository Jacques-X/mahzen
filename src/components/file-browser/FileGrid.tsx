import React from 'react';
import type { FileInfo } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { getDisplayName } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface FileGridProps {
  files: FileInfo[];
  handleNavigate: (path: string) => void;
  handleOpenFile: (path: string) => void;
  iconCache: Record<string, string>;
}

export const FileGrid = React.memo<FileGridProps>(({ files, handleNavigate, handleOpenFile, iconCache }) => {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10">
      {files.map((file: FileInfo) => (
        <div
          key={file.path}
          onClick={() => file.is_dir && handleNavigate(file.path)}
          onDoubleClick={() => !file.is_dir && handleOpenFile(file.path)}
          className={`group flex flex-col items-center p-4 rounded-2xl border border-transparent transition-all cursor-pointer ${
            theme === 'light'
              ? 'hover:bg-white hover:shadow-sm hover:border-gray-100'
              : 'hover:bg-gray-700 hover:shadow-sm hover:border-gray-600'
          }`}
          title={file.name}
        >
          <div className="w-12 h-12 mb-2 flex items-center justify-center transition-transform group-hover:scale-105">
            <FileIcon file={file} size={48} iconData={iconCache[file.path]} />
          </div>
          <span className={`text-xs text-center font-medium line-clamp-2 break-words w-full px-1 leading-tight ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-200'
          }`}>
            {getDisplayName(file.name, file.extension)}
          </span>
          <span className={`text-[10px] mt-0.5 ${
            theme === 'light' ? 'text-gray-400' : 'text-gray-400'
          }`}>
            {file.is_dir ? '' : (file.size / 1024).toFixed(0) + ' KB'}
          </span>
        </div>
      ))}
    </div>
  );
});
