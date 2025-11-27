import React from 'react';
import { MoreVertical } from 'lucide-react';
import type { FileInfo } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { getDisplayName } from '../../utils/formatters';

interface FileListProps {
  files: FileInfo[];
  handleNavigate: (path: string) => void;
  handleOpenFile: (path: string) => void;
  iconCache: Record<string, string>;
}

export const FileList = React.memo<FileListProps>(({ files, handleNavigate, handleOpenFile, iconCache }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
    <table className="w-full text-left">
      <thead className="text-xs text-gray-400 font-medium bg-gray-50/80 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm">
        <tr>
          <th className="py-3 pl-6 font-normal w-1/2">Name</th>
          <th className="py-3 font-normal hidden sm:table-cell">Size</th>
          <th className="py-3 font-normal hidden md:table-cell">Modified</th>
          <th className="py-3 pr-6"></th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {files.map((file: FileInfo) => (
          <tr
            key={file.path}
            onClick={() => file.is_dir && handleNavigate(file.path)}
            onDoubleClick={() => !file.is_dir && handleOpenFile(file.path)}
            className="hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-none cursor-pointer"
          >
            <td className="py-2 pl-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <FileIcon file={file} size={20} iconData={iconCache[file.path]} />
                </div>
                <span className="font-medium text-gray-700 truncate max-w-[300px]">
                  {getDisplayName(file.name, file.extension)}
                </span>
              </div>
            </td>
            <td className="py-2 hidden sm:table-cell text-xs text-gray-500">
              {file.is_dir ? '--' : (file.size / 1024).toFixed(1) + ' KB'}
            </td>
            <td className="py-2 text-gray-500 text-xs hidden md:table-cell">
              {new Date(file.last_modified * 1000).toLocaleDateString()}
            </td>
            <td className="py-2 pr-6 text-right">
              <MoreVertical size={16} className="text-gray-300 cursor-pointer group-hover:text-gray-500 inline" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));
