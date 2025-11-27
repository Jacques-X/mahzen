import { useState, useCallback, useEffect } from 'react';

export const useResize = (initialWidth: number, min: number, max: number) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = useCallback(() => setIsResizing(true), []);
  const stopResize = useCallback(() => setIsResizing(false), []);

  const resize = useCallback((e: MouseEvent, fromRight: boolean = false) => {
    if (isResizing) {
      const newWidth = fromRight 
        ? Math.max(min, Math.min(max, window.innerWidth - e.clientX))
        : Math.max(min, Math.min(max, e.clientX));
      setWidth(newWidth);
    }
  }, [isResizing, min, max]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => resize(e);
    const handleMouseUp = () => stopResize();

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resize, stopResize]);

  return { width, setWidth, isResizing, startResize };
};
