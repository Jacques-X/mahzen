import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, DOCUMENT_EXTENSIONS } from '../constants/fileTypes';

export const isPreviewable = (extension: string): boolean => {
  const ext = extension.toLowerCase();
  return ext === 'app' || IMAGE_EXTENSIONS.includes(ext);
};

export const getFileCategory = (extension: string): string => {
  const ext = extension.toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return 'photos';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'videos';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  if (DOCUMENT_EXTENSIONS.includes(ext)) return 'documents';
  if (ext === 'app') return 'apps';
  return 'other';
};
