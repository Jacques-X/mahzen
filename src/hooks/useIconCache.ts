import { useState, useEffect, useRef } from 'react';
import type { FileInfo } from '../types';
import { tauriService } from '../services/tauriService';
import { isPreviewable } from '../utils/fileHelpers';
import { CACHE_LIMIT, ICON_CHUNK_SIZE } from '../constants/fileTypes';

export const useIconCache = (files: FileInfo[]) => {
  const [iconCache, setIconCache] = useState<Record<string, string>>({});
  const fetchedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadIcons = async () => {
      const previewableFiles = files.filter(f => {
        if (f.is_dir) return false;
        if (fetchedPaths.current.has(f.path)) return false;
        return isPreviewable(f.extension);
      });

      if (previewableFiles.length === 0) return;
      previewableFiles.forEach(f => fetchedPaths.current.add(f.path));

      for (let i = 0; i < previewableFiles.length; i += ICON_CHUNK_SIZE) {
        const chunk = previewableFiles.slice(i, i + ICON_CHUNK_SIZE);
        const results = await Promise.all(
          chunk.map(async (file) => {
            try {
              const data = await tauriService.getFilePreview(file.path);
              return { path: file.path, data };
            } catch (e) {
              return null;
            }
          })
        );

        setIconCache(prev => {
          const next = { ...prev };
          let added = false;
          results.forEach(res => {
            if (res) {
              next[res.path] = res.data;
              added = true;
            }
          });

          if (Object.keys(next).length > CACHE_LIMIT) {
            const freshCache: Record<string, string> = {};
            results.forEach(res => {
              if (res) freshCache[res.path] = res.data;
            });
            return freshCache;
          }
          return added ? next : prev;
        });
      }
    };

    loadIcons();
  }, [files]);

  return iconCache;
};
