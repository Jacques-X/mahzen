import { useState, useCallback } from 'react';

interface NavigationState {
  history: string[];
  index: number;
}

export const useNavigation = (initialPath: string = '') => {
  // 1. Merge state to ensure history and index are ALWAYS in sync
  const [state, setState] = useState<NavigationState>({
    history: [initialPath],
    index: 0
  });

  const navigate = useCallback((path: string) => {
    setState(prev => {
      // safe logic: we use 'prev.index' from the actual previous state
      // instead of 'historyIndex' from the closure.
      const newHistory = prev.history.slice(0, prev.index + 1);
      newHistory.push(path);
      
      return {
        history: newHistory,
        index: newHistory.length - 1
      };
    });
  }, []);

  const goBack = useCallback(() => {
    // We can check the current state synchronously here because 
    // we added 'state' to the dependency array.
    if (state.index > 0) {
      const newIndex = state.index - 1;
      const newPath = state.history[newIndex];
      
      setState(prev => ({
        ...prev,
        index: newIndex
      }));
      
      return newPath;
    }
    return null;
  }, [state]);

  const goForward = useCallback(() => {
    if (state.index < state.history.length - 1) {
      const newIndex = state.index + 1;
      const newPath = state.history[newIndex];

      setState(prev => ({
        ...prev,
        index: newIndex
      }));
      
      return newPath;
    }
    return null;
  }, [state]);

  return {
    navigate,
    goBack,
    goForward,
    canGoBack: state.index > 0,
    canGoForward: state.index < state.history.length - 1,
    // Ensure we never return undefined, fallback to initial if needed
    currentPath: state.history[state.index] || initialPath 
  };
};