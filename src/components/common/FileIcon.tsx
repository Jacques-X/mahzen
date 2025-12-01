import React from 'react';
import { LayoutGrid, ImageIcon, Video, Music, FileText, File, FolderOpen } from 'lucide-react';
import type { FileInfo } from '../../types';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, DOCUMENT_EXTENSIONS } from '../../constants/fileTypes';

interface FileIconProps {
  file: FileInfo;
  size: number;
  iconData?: string | null;
}

export const FileIcon = React.memo<FileIconProps>(({ file, size, iconData }) => {
  if (file.is_dir) {
    return <FolderOpen style={{ width: size, height: size, objectFit: 'contain' }} className="text-purple-600" />;
  }

  if (iconData) {
    return <img src={`data:image/png;base64,${iconData}`} alt={file.name} style={{ width: size, height: size, objectFit: 'contain' }} />;
  }

  const e = file.extension.toLowerCase();

  if (e === 'app') return <LayoutGrid size={size} className="text-gray-700" />;
  if (IMAGE_EXTENSIONS.includes(e)) return <ImageIcon size={size} className="text-purple-500" />;
  if (VIDEO_EXTENSIONS.includes(e)) return <Video size={size} className="text-red-500" />;
  if (AUDIO_EXTENSIONS.includes(e)) return <Music size={size} className="text-pink-500" />;
  if (DOCUMENT_EXTENSIONS.includes(e)) return <FileText size={size} className="text-blue-500" />;

  return <File size={size} />;
});
