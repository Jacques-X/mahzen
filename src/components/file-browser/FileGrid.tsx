import React from 'react';
import type { FileInfo } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { getDisplayName } from '../../utils/formatters';

interface FileGridProps {
  files: FileInfo[];
  handleNavigate: (path: string) => void;
  handleOpenFile: (path: string) => void;
  iconCache: Record<string, string>;
}

export const FileGrid = React.memo<FileGridProps>(({ files, handleNavigate, handleOpenFile, iconCache }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10">
    {files.map((file: FileInfo) => (
      <div
        key={file.path}
        onClick={() => file.is_dir && handleNavigate(file.path)}
        onDoubleClick={() => !file.is_dir && handleOpenFile(file.path)}
        className="group flex flex-col items-center p-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all cursor-pointer"
        title={file.name}
      >
        <div className="w-12 h-12 mb-2 flex items-center justify-center transition-transform group-hover:scale-105">
          <FileIcon file={file} size={48} iconData={iconCache[file.path]} />
        </div>
        <span className="text-xs text-center font-medium text-gray-700 line-clamp-2 break-words w-full px-1 leading-tight">
          {getDisplayName(file.name, file.extension)}
        </span>
        <span className="text-[10px] text-gray-400 mt-0.5">
          {file.is_dir ? '' : (file.size / 1024).toFixed(0) + ' KB'}
        </span>
      </div>
    ))}
  </div>
));
