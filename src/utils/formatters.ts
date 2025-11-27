export const formatSize = (bytes: number): string => {
  if (bytes >= 1000000000) return (bytes / 1000000000).toFixed(2) + ' GB';
  if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
  return (bytes / 1000).toFixed(0) + ' KB';
};

export const formatMemory = (bytes: number): string => {
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB";
};

export const getDisplayName = (fileName: string, extension: string): string => {
  if (extension.toLowerCase() === 'app') {
    return fileName.replace(/\.app$/i, '');
  }
  return fileName;
};
