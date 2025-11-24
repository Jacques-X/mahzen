import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  MoreVertical, FileText, Monitor, 
  Trash2, Cloud, ArrowBigDownDash, SendHorizonal, HomeIcon,
  LayoutGrid, Image as ImageIcon, Music, Video, File, 
  List as ListIcon, ChevronLeft, ChevronRight, RefreshCw, MapPin, HardDrive
} from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';

/* ==================================================================================
   SECTION 1: INTERFACES & TYPES
   ================================================================================== */

interface FileInfo {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  last_modified: number;
  extension: string;
}

interface QuickPaths {
  home: string;
  desktop: string;
  documents: string;
  downloads: string;
  movies: string;
  pictures: string;
}

interface DiskStats {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
}

interface FolderStats {
  total_size: number;
  file_count: number;
  folder_count: number;
  breakdown: {
    documents: number;
    photos: number;
    videos: number;
    audio: number;
    apps: number;
    other: number;
  };
}

/* ==================================================================================
   SECTION 2: HELPER COMPONENTS (ATOMS)
   ================================================================================== */

const FileIcon = React.memo(({ file, size, iconData }: { file: FileInfo, size: number, iconData?: string | null }) => {
    if (file.is_dir) return <img src="/kaxxa.png" alt="Folder" style={{ width: size, height: size, objectFit: 'contain' }} />;
    if (iconData) return <img src={`data:image/png;base64,${iconData}`} alt={file.name} style={{ width: size, height: size, objectFit: 'contain' }} />;

    const e = file.extension.toLowerCase();
    
    if (e === 'app') return <LayoutGrid size={size} className="text-gray-700" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(e)) return <ImageIcon size={size} className="text-purple-500" />;
    if (['mp4', 'mov', 'avi', 'mkv'].includes(e)) return <Video size={size} className="text-red-500" />;
    if (['mp3', 'wav', 'flac'].includes(e)) return <Music size={size} className="text-pink-500" />;
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(e)) return <FileText size={size} className="text-blue-500" />;
    
    return <File size={size} className="text-gray-400" />;
});

const NavItem = React.memo(({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group mb-0.5 ${active ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
    <div className="flex items-center space-x-3">
      <span className={active ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}>{icon}</span>
      <span className={`text-sm font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </div>
  </div>
));

const getDisplayName = (file: FileInfo) => {
  if (file.extension.toLowerCase() === 'app') return file.name.replace(/\.app$/i, '');
  return file.name;
};

/* ==================================================================================
   SECTION 3: FILE VIEW COMPONENTS (MOLECULES)
   ================================================================================== */

const FileBrowserHeader = React.memo(({ 
    currentPath, viewMode, setViewMode, 
    handleGoBack, handleGoForward, canGoBack, canGoForward, 
    handleNavigate 
}: any) => {
  const [pathInput, setPathInput] = useState(currentPath);

  useEffect(() => {
    setPathInput(currentPath || "Home");
  }, [currentPath]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = pathInput === "Home" ? "" : pathInput;
      handleNavigate(target);
    }
  };

  return (
    <div data-tauri-drag-region className="h-20 flex items-center justify-between px-6 bg-white border-b border-gray-100">
      <div className="relative flex-1 mr-4 flex items-center space-x-2">
         <div className="flex items-center space-x-1 mr-2">
             <button 
                onClick={handleGoBack} 
                disabled={!canGoBack}
                className={`p-2 rounded-full transition-colors ${canGoBack ? 'hover:bg-gray-100 text-gray-500' : 'text-gray-300 cursor-not-allowed'}`}
             >
                <ChevronLeft size={20} />
             </button>
             <button 
                onClick={handleGoForward} 
                disabled={!canGoForward}
                className={`p-2 rounded-full transition-colors ${canGoForward ? 'hover:bg-gray-100 text-gray-500' : 'text-gray-300 cursor-not-allowed'}`}
             >
                <ChevronRight size={20} />
             </button>
         </div>

         <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
                type="text" 
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter path..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:outline-none text-gray-600 font-medium focus:ring-2 focus:ring-purple-100 transition-all"
            />
         </div>
      </div>
  
      <div className="flex items-center">
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
            >
                <LayoutGrid size={18} />
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
            >
                <ListIcon size={18} />
            </button>
        </div>
      </div>
    </div>
  );
});

const FileGrid = React.memo(({ files, handleNavigate, handleOpenFile, iconCache }: any) => (
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
                {getDisplayName(file)}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
                {file.is_dir ? '' : (file.size / 1024).toFixed(0) + ' KB'}
            </span>
        </div>
    ))}
  </div>
));

const FileList = React.memo(({ files, handleNavigate, handleOpenFile, iconCache }: any) => (
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
                  {getDisplayName(file)}
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

/* ==================================================================================
   SECTION 4: SIDEBAR COMPONENTS (ORGANISMS)
   ================================================================================== */

const LeftSidebar = React.memo(({ width, onStartResize, quickPaths, onNavigate, currentPath }: any) => {
  const handleClose = async () => { try { const w = getCurrentWindow(); await w.close(); } catch (e) {} };
  const handleMin = async () => { try { const w = getCurrentWindow(); await w.minimize(); } catch (e) {} };
  const handleMax = async () => { try { const w = getCurrentWindow(); await w.toggleMaximize(); } catch (e) {} };

  return (
    <div style={{ width }} className="relative flex-shrink-0 flex flex-col group">
      <div className="bg-white h-full rounded-3xl shadow-sm flex flex-col border border-gray-100 overflow-hidden">
        <div data-tauri-drag-region className="px-5 pt-5 pb-2 flex items-center space-x-2 select-none">
          <div onClick={handleClose} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] hover:bg-[#FF5F57]/80 cursor-pointer shadow-sm"></div>
          <div onClick={handleMin} className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:bg-[#FFBD2E]/80 cursor-pointer shadow-sm"></div>
          <div onClick={handleMax} className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] hover:bg-[#28C840]/80 cursor-pointer shadow-sm"></div>
        </div>
        
        <div data-tauri-drag-region className="h-14 flex items-center px-5 border-b border-gray-50/50">
          <img 
            src="/logo.png" 
            alt="MAĦŻEN" 
            className="h-7 w-auto object-contain"
          />
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {quickPaths && (
            <>
              <NavItem icon={<HomeIcon size={18} />} label="Home" active={currentPath === quickPaths.home} onClick={() => onNavigate(quickPaths.home)} />
              
              <NavItem 
                icon={<LayoutGrid size={18} />} 
                label="Applications" 
                active={currentPath === "/Applications"} 
                onClick={() => onNavigate("/Applications")} 
              />
              
              <NavItem 
                icon={<Cloud size={18} />} 
                label="Cloud Storage" 
                active={currentPath === (quickPaths.home + "/Library/CloudStorage")}
                onClick={() => onNavigate(quickPaths.home + "/Library/CloudStorage")} 
              />
              
              <NavItem icon={<Monitor size={18} />} label="Desktop" active={currentPath === quickPaths.desktop} onClick={() => onNavigate(quickPaths.desktop)} />
              <NavItem icon={<File size={18} />} label="Documents" active={currentPath === quickPaths.documents} onClick={() => onNavigate(quickPaths.documents)} />
              <NavItem icon={<ArrowBigDownDash size={18} />} label="Downloads" active={currentPath === quickPaths.downloads} onClick={() => onNavigate(quickPaths.downloads)} />
              
              <div className="pt-8 pb-2">
                <NavItem 
                    icon={<SendHorizonal size={18} />} 
                    label="Airdrop" 
                    active={false} 
                    onClick={() => onNavigate(quickPaths.downloads)} 
                />
                
                <NavItem 
                    icon={<Trash2 size={18} />} 
                    label="Bin" 
                    active={currentPath === quickPaths.home + "/.Trash"} 
                    onClick={() => onNavigate(quickPaths.home + "/.Trash")} 
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="absolute -right-3 top-10 bottom-10 w-6 flex items-center justify-center cursor-col-resize z-50 group-hover:opacity-100 opacity-0 transition-opacity" onMouseDown={onStartResize}><div className="w-1 h-12 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors shadow-sm"></div></div>
    </div>
  );
});

const RightSidebar = React.memo(({ width, onStartResize, folderStats, diskStats, currentPath, onRescan, isScanning }: any) => {
  const isRoot = currentPath === "/";

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000000) return (bytes / 1000000000).toFixed(2) + ' GB';
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
    return (bytes / 1000).toFixed(0) + ' KB';
  };

  const breakdown = useMemo(() => {
    // If we are at root, show Disk Stats breakdown
    if (isRoot && diskStats) {
        return [
            { label: 'Used Space', size: diskStats.used_bytes, sizeStr: formatSize(diskStats.used_bytes), color: 'bg-gray-700', icon: HardDrive },
            { label: 'Free Space', size: diskStats.free_bytes, sizeStr: formatSize(diskStats.free_bytes), color: 'bg-green-500', icon: Cloud },
        ];
    }

    if (!folderStats || !folderStats.breakdown) return [];
    
    const b = folderStats.breakdown;
    return [
      { label: 'Documents', size: b.documents, sizeStr: formatSize(b.documents), color: 'bg-blue-500', icon: FileText },
      { label: 'Photos', size: b.photos, sizeStr: formatSize(b.photos), color: 'bg-purple-500', icon: ImageIcon },
      { label: 'Videos', size: b.videos, sizeStr: formatSize(b.videos), color: 'bg-red-500', icon: Video },
      { label: 'Audio', size: b.audio, sizeStr: formatSize(b.audio), color: 'bg-pink-500', icon: Music },
      { label: 'Applications', size: b.apps, sizeStr: formatSize(b.apps), color: 'bg-gray-700', icon: LayoutGrid },
      { label: 'Other', size: b.other, sizeStr: formatSize(b.other), color: 'bg-yellow-500', icon: File },
    ].filter(i => i.size > 0);
  }, [folderStats, diskStats, isRoot]);

  // Determine which Total to use for the graph
  const totalGraphSize = isRoot && diskStats ? diskStats.total_bytes : (folderStats ? folderStats.total_size : 0);

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      const startRad = (startAngle - 180) * Math.PI / 180;
      const endRad = (endAngle - 180) * Math.PI / 180;

      const x1 = x + radius * Math.cos(startRad);
      const y1 = y + radius * Math.sin(startRad);

      const x2 = x + radius * Math.cos(endRad);
      const y2 = y + radius * Math.sin(endRad);

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      return [
           "M", x1, y1, 
           "A", radius, radius, 0, largeArcFlag, 1, x2, y2
      ].join(" ");
  };

  const segments = useMemo(() => {
    if (totalGraphSize === 0) return [];
    
    let currentAngle = 0;
    
    return breakdown.map((item: any) => {
      const percentage = item.size / totalGraphSize;
      const angleSpan = percentage * 180;
      
      const segment = {
        ...item,
        path: describeArc(50, 50, 40, currentAngle, currentAngle + angleSpan),
        percentage: (percentage * 100).toFixed(1),
        colorHex: item.color === 'bg-blue-500' ? '#3b82f6' :
                 item.color === 'bg-purple-500' ? '#a855f7' :
                 item.color === 'bg-red-500' ? '#ef4444' :
                 item.color === 'bg-pink-500' ? '#ec4899' :
                 item.color === 'bg-gray-700' ? '#374151' :
                 item.color === 'bg-green-500' ? '#22c55e' :
                 item.color === 'bg-yellow-500' ? '#eab308' : '#9ca3af'
      };
      
      currentAngle += angleSpan;
      return segment;
    });
  }, [breakdown, totalGraphSize]);

  return (
    <div style={{ width }} className="relative flex-shrink-0 flex-col hidden lg:flex group">
      <div className="absolute -left-3 top-10 bottom-10 w-6 flex items-center justify-center cursor-col-resize z-50 group-hover:opacity-100 opacity-0 transition-opacity" onMouseDown={onStartResize}><div className="w-1 h-12 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors shadow-sm"></div></div>

      <div className="bg-white h-full rounded-3xl shadow-sm border border-gray-100 flex flex-col p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
             {isRoot ? 'Disk Usage' : 'Folder Details'}
          </h3>
          <button 
            onClick={onRescan}
            disabled={isScanning}
            className={`p-2 rounded-lg transition-all ${isScanning ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            title="Rescan"
          >
            <RefreshCw size={16} className={`text-gray-500 ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-20 overflow-hidden mb-3 flex justify-center">
             <svg viewBox="0 0 100 50" className="w-full h-full">
               <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
               
               {segments.map((seg: any, i: number) => (
                   <path 
                     key={i} 
                     d={seg.path} 
                     fill="none" 
                     stroke={seg.colorHex} 
                     strokeWidth="10" 
                     strokeLinecap="butt"
                     className="transition-all duration-700 ease-out"
                   />
               ))}
             </svg>
          </div>
          
          <div className="text-2xl font-bold text-gray-800">
            {formatSize(totalGraphSize)}
          </div>
          <div className="text-xs text-gray-400">Total Size</div>
          
          {!isRoot && (
              <div className="flex items-center gap-4 mt-3">
                <div className="text-center">
                  <div className="text-base font-bold text-purple-600">{folderStats ? folderStats.file_count : 0}</div>
                  <div className="text-[10px] text-gray-400">Files</div>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-base font-bold text-blue-600">{folderStats ? folderStats.folder_count : 0}</div>
                  <div className="text-[10px] text-gray-400">Folders</div>
                </div>
              </div>
          )}
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
          {breakdown.length === 0 ? (
            <div className="text-center text-gray-400 text-xs mt-4">
              {isScanning ? 'Scanning...' : 'No data available'}
            </div>
          ) : (
            breakdown.map((item: any, idx: number) => {
              const segment = segments.find(s => s.label === item.label);
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded-lg ${item.color} bg-opacity-10 flex items-center justify-center`}>
                      <item.icon size={12} className={item.color.replace('bg-', 'text-')} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-700">{item.label}</div>
                      <div className="text-[9px] text-gray-400">
                        {segment ? segment.percentage : '0'}%
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-purple-600">{item.sizeStr}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

/* ==================================================================================
   SECTION 5: MAIN CONTENT COMPONENT
   ================================================================================== */

const MainContent = React.memo(({ 
  currentPath, files, viewMode, setViewMode, 
  handleGoBack, handleGoForward, canGoBack, canGoForward,
  handleNavigate, handleOpenFile, iconCache 
}: any) => {
  return (
    <div className="flex-1 min-w-0 bg-[#F9FAFB] rounded-3xl shadow-sm border border-gray-200/60 flex flex-col overflow-hidden relative">
      
      <FileBrowserHeader 
        currentPath={currentPath} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        handleGoBack={handleGoBack}
        handleGoForward={handleGoForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        handleNavigate={handleNavigate} 
      />

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 custom-scrollbar">
        {files.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400"><p className="text-sm">This folder is empty</p></div>
        ) : viewMode === 'grid' ? (
          <FileGrid 
            files={files} 
            handleNavigate={handleNavigate} 
            handleOpenFile={handleOpenFile} 
            iconCache={iconCache} 
          />
        ) : (
          <FileList 
            files={files} 
            handleNavigate={handleNavigate} 
            handleOpenFile={handleOpenFile} 
            iconCache={iconCache} 
          />
        )}
      </div>
    </div>
  );
});

/* ==================================================================================
   SECTION 6: APP CONTROLLER (ROOT)
   ================================================================================== */

export default function App() {
  const [leftWidth, setLeftWidth] = useState(180);
  const [rightWidth, setRightWidth] = useState(200);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const [currentPath, setCurrentPath] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [files, setFiles] = useState<FileInfo[]>([]);
  const [quickPaths, setQuickPaths] = useState<QuickPaths | null>(null);
  const [folderStats, setFolderStats] = useState<FolderStats | null>(null);
  const [diskStats, setDiskStats] = useState<DiskStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isScanning, setIsScanning] = useState(false);
  
  const [iconCache, setIconCache] = useState<Record<string, string>>({});
  const fetchedPaths = useRef<Set<string>>(new Set());

  // Initialization
  useEffect(() => {
    invoke<QuickPaths>('get_quick_paths').then(paths => {
        setQuickPaths(paths);
        const startPath = paths.home;
        
        // Initialize history
        setHistory([startPath]);
        setHistoryIndex(0);
        
        loadDirectory(startPath); 
    }).catch(e => console.log("Backend error:", e));
  }, []);

  // Icon Loading Effect
  useEffect(() => {
    const loadIcons = async () => {
        const previewableFiles = files.filter(f => {
            if (f.is_dir) return false;
            if (fetchedPaths.current.has(f.path)) return false;
            const ext = f.extension.toLowerCase();
            return ext === 'app' || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico'].includes(ext);
        });

        if (previewableFiles.length === 0) return;
        previewableFiles.forEach(f => fetchedPaths.current.add(f.path));

        const CHUNK_SIZE = 5;
        for (let i = 0; i < previewableFiles.length; i += CHUNK_SIZE) {
            const chunk = previewableFiles.slice(i, i + CHUNK_SIZE);
            const results = await Promise.all(chunk.map(async (file) => {
                try {
                    const data = await invoke<string>('get_file_preview', { path: file.path });
                    return { path: file.path, data };
                } catch (e) { return null; }
            }));
            
            setIconCache(prev => {
                const CACHE_LIMIT = 100;
                const next = { ...prev };
                let added = false;
                results.forEach(res => { 
                  if (res) { next[res.path] = res.data; added = true; }
                });
                if (Object.keys(next).length > CACHE_LIMIT) {
                    const freshCache: Record<string, string> = {};
                    results.forEach(res => { if (res) freshCache[res.path] = res.data; });
                    return freshCache; 
                }
                return added ? next : prev;
            });
        }
    };
    loadIcons();
  }, [files]);

  // Core File Loading logic
  const loadDirectory = async (path: string) => {
    try {
      const entries = await invoke<FileInfo[]>('read_directory', { path });
      setFiles(entries);
      if (path !== currentPath) setCurrentPath(path);
      
      setIsScanning(true);
      
      if (path === "/") {
          // Load Disk Stats if at root
          invoke<DiskStats>('get_disk_stats')
            .then(stats => {
                setDiskStats(stats);
                setIsScanning(false);
            })
            .catch(e => console.log("Disk stats error:", e));
      } else {
          // Load Folder Stats otherwise
          invoke<FolderStats>('get_folder_stats', { path })
            .then(setFolderStats)
            .catch(e => console.log("Stats error:", e))
            .finally(() => setIsScanning(false));
      }
    } catch (error) { console.error("Load directory error:", error); }
  };

  const handleRescan = async () => {
    setIsScanning(true);
    try {
      if (currentPath === "/") {
          const stats = await invoke<DiskStats>('get_disk_stats');
          setDiskStats(stats);
      } else {
          await invoke('clear_stats_cache');
          const stats = await invoke<FolderStats>('get_folder_stats', { path: currentPath });
          setFolderStats(stats);
      }
    } catch (e) { console.log("Rescan error:", e); } 
    finally { setIsScanning(false); }
  };

  const handleNavigate = useCallback((path: string) => {
    setHistory(prev => {
        const newHist = prev.slice(0, historyIndex + 1);
        newHist.push(path);
        return newHist;
    });
    setHistoryIndex(prev => prev + 1);
    loadDirectory(path);
  }, [historyIndex]);
  
  const handleGoBack = () => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        loadDirectory(history[newIndex]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        loadDirectory(history[newIndex]);
    }
  };

  const handleOpenFile = async (path: string) => { try { await invoke('open_file', { path }); } catch (e) { console.error(e); } };

  const startResizingLeft = useCallback(() => setIsResizingLeft(true), []);
  const startResizingRight = useCallback(() => setIsResizingRight(true), []);
  const stopResizing = useCallback(() => { setIsResizingLeft(false); setIsResizingRight(false); }, []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizingLeft) {
      setLeftWidth(Math.max(180, Math.min(400, e.clientX))); 
    }
    if (isResizingRight) {
      setRightWidth(Math.max(230, Math.min(500, window.innerWidth - e.clientX))); 
    }
  }, [isResizingLeft, isResizingRight]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); };
  }, [resize, stopResizing]);

  return (
    <div data-tauri-drag-region className={`flex h-screen w-full bg-gray-200 font-sans overflow-hidden p-3 gap-3 rounded-3xl border border-gray-400/20 shadow-2xl ${isResizingLeft || isResizingRight ? 'cursor-col-resize select-none' : ''}`}>
      <LeftSidebar width={leftWidth} onStartResize={startResizingLeft} quickPaths={quickPaths} onNavigate={handleNavigate} currentPath={currentPath} />
      <MainContent 
        currentPath={currentPath} 
        files={files} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        handleGoBack={handleGoBack}
        handleGoForward={handleGoForward}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        handleNavigate={handleNavigate} 
        handleOpenFile={handleOpenFile} 
        iconCache={iconCache} 
      />
      <RightSidebar 
        width={rightWidth} 
        onStartResize={startResizingRight} 
        folderStats={folderStats}
        diskStats={diskStats} 
        currentPath={currentPath}
        onRescan={handleRescan}
        isScanning={isScanning}
      />
    </div>
  );
}