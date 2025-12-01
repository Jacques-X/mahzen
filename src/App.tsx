import { useState, useEffect } from 'react';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { RightSidebar } from './components/sidebar/RightSidebar';
import { MainContent } from './components/layout/MainContent';
import { useResize } from './hooks/useResize';
import { useNavigation } from './hooks/useNavigation';
import { useIconCache } from './hooks/useIconCache';
import { tauriService } from './services/tauriService';
import type { FileInfo, QuickPaths, FolderStats, DiskStats, SystemStats, ViewMode, RightTabMode } from './types';

export default function App() {
  // Sidebar widths with resize hooks
  const leftSidebar = useResize(180, 180, 400);
  const rightSidebar = useResize(230, 230, 500);

  // Right sidebar tab state
  const [savedInfoWidth, setSavedInfoWidth] = useState(230);
  const [activeRightTab, setActiveRightTab] = useState<RightTabMode>('info');

  // Navigation
  const navigation = useNavigation('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Data state
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [quickPaths, setQuickPaths] = useState<QuickPaths | null>(null);
  const [folderStats, setFolderStats] = useState<FolderStats | null>(null);
  const [diskStats, setDiskStats] = useState<DiskStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Icon cache
  const iconCache = useIconCache(files);

  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        const paths = await tauriService.getQuickPaths();
        setQuickPaths(paths);
        navigation.navigate(paths.home);
        await loadDirectory(paths.home);
      } catch (e) {
        console.error('Initialization error:', e);
      }
    };
    init();
  }, []);

  // Poll system stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await tauriService.getSystemStats();
        setSystemStats(stats);
      } catch (e) {
        console.error('Failed to fetch system stats', e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Load directory contents
  const loadDirectory = async (path: string) => {
    try {
      setIsScanning(true);
      
      // Load directory entries and stats in parallel
      const [entries, stats] = await Promise.all([
        tauriService.readDirectory(path),
        path === '/'
          ? tauriService.getDiskStats()
          : tauriService.getFolderStats(path)
      ]);
      
      setFiles(entries);
      if (path === '/') {
        setDiskStats(stats as any);
      } else {
        setFolderStats(stats as any);
      }
      setIsScanning(false);
    } catch (error) {
      console.error('Load directory error:', error);
      setIsScanning(false);
    }
  };

  // Navigation handlers
  const handleNavigate = (path: string) => {
    navigation.navigate(path);
    loadDirectory(path);
  };

  const handleGoBack = () => {
    const path = navigation.goBack();
    if (path !== null) {
      loadDirectory(path);
    }
  };

  const handleGoForward = () => {
    const path = navigation.goForward();
    if (path !== null) {
      loadDirectory(path);
    }
  };

  // File operations
  const handleOpenFile = async (path: string) => {
    try {
      await tauriService.openFile(path);
    } catch (e) {
      console.error('Failed to open file:', e);
    }
  };

  // Rescan folder/disk stats
  const handleRescan = async () => {
    setIsScanning(true);
    try {
      if (navigation.currentPath === '/') {
        const stats = await tauriService.getDiskStats();
        setDiskStats(stats);
      } else {
        const stats = await tauriService.getFolderStats(navigation.currentPath);
        setFolderStats(stats);
      }
    } catch (e) {
      console.error('Rescan error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  // Process management
  const handleKillProcess = async (pid: number) => {
    // Optimistic update
    setSystemStats((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        top_processes: prev.top_processes.filter((p) => p.pid !== pid),
      };
    });

    try {
      await tauriService.killProcess(pid);
    } catch (e) {
      console.error('Failed to kill process:', e);
      // Refresh stats on failure to restore actual state
      const stats = await tauriService.getSystemStats();
      setSystemStats(stats);
    }
  };

  // Right sidebar tab switching with width management
  const handleRightTabChange = (tab: RightTabMode) => {
    if (tab === activeRightTab) return;

    if (tab === 'activity') {
      // Save current width if in info mode
      if (activeRightTab === 'info') {
        setSavedInfoWidth(rightSidebar.width);
      }
      rightSidebar.setWidth(350);
    } else {
      // Restore saved width when switching back to info
      rightSidebar.setWidth(savedInfoWidth);
    }
    setActiveRightTab(tab);
  };

  // Handle right sidebar resize
  const handleRightResize = (e: MouseEvent) => {
    if (rightSidebar.isResizing) {
      const newWidth = Math.max(230, Math.min(500, window.innerWidth - e.clientX));
      rightSidebar.setWidth(newWidth);

      // If resizing in info mode, save this as preferred width
      if (activeRightTab === 'info') {
        setSavedInfoWidth(newWidth);
      }
    }
  };

  // Override the default resize handler for right sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rightSidebar.isResizing) {
        handleRightResize(e);
      }
    };

    if (rightSidebar.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [rightSidebar.isResizing, activeRightTab]);

  return (
    <div
      data-tauri-drag-region
      className={`flex h-screen w-full bg-gray-200 font-sans overflow-hidden p-3 gap-3 rounded-3xl border border-gray-400/20 shadow-2xl ${
        leftSidebar.isResizing || rightSidebar.isResizing ? 'cursor-col-resize select-none' : ''
      }`}
    >
      <LeftSidebar
        width={leftSidebar.width}
        onStartResize={leftSidebar.startResize}
        quickPaths={quickPaths}
        onNavigate={handleNavigate}
        currentPath={navigation.currentPath}
      />

      <MainContent
        currentPath={navigation.currentPath}
        files={files}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleGoBack={handleGoBack}
        handleGoForward={handleGoForward}
        canGoBack={navigation.canGoBack}
        canGoForward={navigation.canGoForward}
        handleNavigate={handleNavigate}
        handleOpenFile={handleOpenFile}
        iconCache={iconCache}
      />

      <RightSidebar
        width={rightSidebar.width}
        onStartResize={rightSidebar.startResize}
        folderStats={folderStats}
        diskStats={diskStats}
        currentPath={navigation.currentPath}
        onRescan={handleRescan}
        isScanning={isScanning}
        systemStats={systemStats}
        onKillProcess={handleKillProcess}
        activeTab={activeRightTab}
        onTabChange={handleRightTabChange}
      />
    </div>
  );
}