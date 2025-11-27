#!/bin/bash

# Rust Backend Refactor Script
# This reorganizes your Tauri backend into a modular structure
# Run in your project root: chmod +x refactor-backend.sh && ./refactor-backend.sh

set -e

echo "🦀 Refactoring Rust Backend..."
echo ""

# Check if we're in the right place
if [ ! -d "src-tauri" ]; then
    echo "❌ Error: src-tauri directory not found!"
    echo "Please run this script from your project root."
    exit 1
fi

cd src-tauri/src

# Backup original lib.rs
cp lib.rs lib.rs.backup
echo "✅ Backed up lib.rs to lib.rs.backup"

# Create module structure
mkdir -p {models,commands,utils,services,cache}

echo "📁 Creating module files..."

# ============================================================================
# models/mod.rs - All data structures
# ============================================================================
cat > models/mod.rs << 'EOF'
use serde::{Deserialize, Serialize};

#[derive(Serialize, Debug)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub last_modified: u64,
    pub extension: String,
}

#[derive(Serialize, Debug)]
pub struct QuickPaths {
    pub home: String,
    pub desktop: String,
    pub documents: String,
    pub downloads: String,
    pub movies: String,
    pub pictures: String,
}

#[derive(Serialize, Debug)]
pub struct DiskStats {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub free_bytes: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FolderStats {
    pub total_size: u64,
    pub file_count: u64,
    pub folder_count: u64,
    pub breakdown: FileTypeBreakdown,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct FileTypeBreakdown {
    pub documents: u64,
    pub photos: u64,
    pub videos: u64,
    pub audio: u64,
    pub apps: u64,
    pub other: u64,
}

#[derive(Serialize, Debug, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory: u64,
}

#[derive(Serialize, Debug, Clone)]
pub struct SystemStats {
    pub cpu_usage: f32,
    pub total_memory: u64,
    pub used_memory: u64,
    pub top_processes: Vec<ProcessInfo>,
}
EOF

# ============================================================================
# utils/file_helpers.rs - File utility functions
# ============================================================================
cat > utils/file_helpers.rs << 'EOF'
use std::fs;
use std::path::Path;

pub fn get_file_type_category(extension: &str) -> &str {
    let ext = extension.to_lowercase();
    match ext.as_str() {
        "pdf" | "doc" | "docx" | "txt" | "md" | "rtf" | "odt" | "pages" | "tex" | "wpd" 
        | "ods" | "xlr" | "xls" | "xlsx" | "csv" | "ppt" | "pptx" | "odp" | "key" 
        | "epub" | "mobi" | "azw" | "azw3" | "djvu" | "xps" | "oxps" | "ps" | "log" 
        | "msg" | "eml" | "vcf" | "ics" => "documents",
        
        "jpg" | "jpeg" | "png" | "gif" | "svg" | "webp" | "bmp" | "tiff" | "tif" 
        | "ico" | "heic" | "heif" | "raw" | "cr2" | "nef" | "orf" | "sr2" | "arw" 
        | "dng" | "psd" | "ai" | "xcf" | "sketch" | "fig" | "indd" | "eps" | "svgz" 
        | "jfif" | "jp2" | "jpx" | "apng" | "avif" | "jxl" => "photos",
        
        "mp4" | "mov" | "avi" | "mkv" | "webm" | "flv" | "wmv" | "m4v" | "mpg" 
        | "mpeg" | "3gp" | "3g2" | "f4v" | "swf" | "vob" | "ogv" | "gifv" | "mts" 
        | "m2ts" | "ts" | "qt" | "yuv" | "rm" | "rmvb" | "asf" | "amv" | "divx" 
        | "mxf" => "videos",
        
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" | "wma" | "opus" | "oga" 
        | "mogg" | "ape" | "alac" | "aiff" | "aif" | "aifc" | "au" | "ra" | "ram" 
        | "voc" | "amr" | "awb" | "dss" | "dvf" | "m4b" | "m4p" | "mid" | "midi" 
        | "mka" | "mlp" | "mpc" | "tta" | "vox" | "wv" => "audio",
        
        "app" | "exe" | "dmg" | "pkg" | "deb" | "rpm" | "apk" | "ipa" | "msi" 
        | "appx" | "appimage" | "snap" | "flatpak" | "bin" | "run" | "bundle" 
        | "command" => "apps",
        
        _ => "other"
    }
}

pub fn calculate_dir_size_recursive(path: &Path) -> u64 {
    let mut total = 0;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_symlink() {
                if let Ok(meta) = fs::metadata(&path) {
                    total += meta.len();
                }
                continue;
            }

            if path.is_dir() {
                total += calculate_dir_size_recursive(&path);
            } else if let Ok(meta) = fs::metadata(&path) {
                total += meta.len();
            }
        }
    }
    total
}

pub fn is_bundle(extension: &str) -> bool {
    matches!(extension, "app" | "framework" | "plugin")
}
EOF

# ============================================================================
# utils/mod.rs
# ============================================================================
cat > utils/mod.rs << 'EOF'
pub mod file_helpers;
EOF

# ============================================================================
# cache/stats_cache.rs - Cache management
# ============================================================================
cat > cache/stats_cache.rs << 'EOF'
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use crate::models::FolderStats;

pub static STATS_CACHE: Mutex<Option<HashMap<String, FolderStats>>> = Mutex::new(None);

fn get_cache_path() -> Option<PathBuf> {
    dirs::data_local_dir().map(|d| d.join("mahzen").join("folder_stats_cache.json"))
}

pub fn load_cache_from_disk() {
    if let Some(path) = get_cache_path() {
        if path.exists() {
            if let Ok(file) = fs::File::open(&path) {
                let reader = std::io::BufReader::new(file);
                if let Ok(loaded_cache) = serde_json::from_reader::<_, HashMap<String, FolderStats>>(reader) {
                    let mut cache = STATS_CACHE.lock().unwrap();
                    *cache = Some(loaded_cache);
                }
            }
        }
    }
}

pub fn save_cache_to_disk() {
    if let Some(path) = get_cache_path() {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let cache = STATS_CACHE.lock().unwrap();
        if let Some(ref cache_map) = *cache {
            if let Ok(file) = fs::File::create(&path) {
                let writer = std::io::BufWriter::new(file);
                let _ = serde_json::to_writer(writer, cache_map);
            }
        }
    }
}

pub fn get_cached_stats(path: &str) -> Option<FolderStats> {
    let cache = STATS_CACHE.lock().unwrap();
    if let Some(ref cache_map) = *cache {
        return cache_map.get(path).cloned();
    }
    None
}

pub fn cache_stats(path: String, stats: FolderStats) {
    let mut cache = STATS_CACHE.lock().unwrap();
    if cache.is_none() {
        *cache = Some(HashMap::new());
    }
    if let Some(ref mut cache_map) = *cache {
        cache_map.insert(path, stats);
    }
}

pub fn clear_cache() {
    let mut cache = STATS_CACHE.lock().unwrap();
    *cache = Some(HashMap::new());
}
EOF

# ============================================================================
# cache/mod.rs
# ============================================================================
cat > cache/mod.rs << 'EOF'
pub mod stats_cache;
EOF

# ============================================================================
# services/filesystem.rs - File operations
# ============================================================================
cat > services/filesystem.rs << 'EOF'
use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use crate::models::{FileInfo, FolderStats, FileTypeBreakdown};
use crate::utils::file_helpers::{get_file_type_category, calculate_dir_size_recursive, is_bundle};

pub fn read_directory_entries(path: &str) -> Result<Vec<FileInfo>, String> {
    let dir_path = if path.is_empty() {
        dirs::home_dir().ok_or("No home")?.to_string_lossy().to_string()
    } else {
        path.to_string()
    };

    let entries = fs::read_dir(&dir_path).map_err(|e| e.to_string())?;
    let mut files: Vec<FileInfo> = Vec::new();

    for entry in entries.flatten() {
        let path_buf = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        if name.starts_with('.') {
            continue;
        }

        let extension = path_buf
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        let is_bundle_type = is_bundle(&extension);
        let metadata = fs::metadata(&path_buf).unwrap_or_else(|_| entry.metadata().unwrap());
        let is_dir = if is_bundle_type { false } else { metadata.is_dir() };

        files.push(FileInfo {
            name,
            path: path_buf.to_string_lossy().to_string(),
            is_dir,
            size: metadata.len(),
            last_modified: metadata
                .modified()
                .unwrap_or(SystemTime::now())
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            extension,
        });
    }

    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(files)
}

pub fn calculate_folder_stats_deep(path: &Path, stats: &mut FolderStats) {
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let is_symlink = entry_path.is_symlink();

            if let Ok(metadata) = entry.metadata() {
                let extension = entry_path
                    .extension()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                let is_bundle_type = is_bundle(&extension);

                if metadata.is_dir() && !is_bundle_type && !is_symlink {
                    stats.folder_count += 1;
                    calculate_folder_stats_deep(&entry_path, stats);
                } else if is_bundle_type {
                    stats.file_count += 1;
                    let bundle_size = calculate_dir_size_recursive(&entry_path);
                    stats.total_size += bundle_size;
                    stats.breakdown.apps += bundle_size;
                } else {
                    stats.file_count += 1;
                    let size = metadata.len();
                    stats.total_size += size;

                    let category = get_file_type_category(&extension);
                    match category {
                        "documents" => stats.breakdown.documents += size,
                        "photos" => stats.breakdown.photos += size,
                        "videos" => stats.breakdown.videos += size,
                        "audio" => stats.breakdown.audio += size,
                        "apps" => stats.breakdown.apps += size,
                        _ => stats.breakdown.other += size,
                    }
                }
            }
        }
    }
}

pub fn get_stats_for_path(path: &str) -> Result<FolderStats, String> {
    let path_obj = Path::new(path);
    let mut stats = FolderStats {
        total_size: 0,
        file_count: 0,
        folder_count: 0,
        breakdown: FileTypeBreakdown::default(),
    };

    calculate_folder_stats_deep(path_obj, &mut stats);
    Ok(stats)
}
EOF

# ============================================================================
# services/system_info.rs - System stats
# ============================================================================
cat > services/system_info.rs << 'EOF'
use std::path::Path;
use sysinfo::{Disks, System, Pid};
use std::sync::Mutex;
use crate::models::{DiskStats, SystemStats, ProcessInfo, QuickPaths};

lazy_static::lazy_static! {
    pub static ref SYSTEM_INSTANCE: Mutex<System> = Mutex::new(System::new_all());
}

pub fn get_quick_paths_info() -> Result<QuickPaths, String> {
    let home = dirs::home_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let desktop = dirs::desktop_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let documents = dirs::document_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let downloads = dirs::download_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let movies = dirs::video_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let pictures = dirs::picture_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    Ok(QuickPaths {
        home,
        desktop,
        documents,
        downloads,
        movies,
        pictures,
    })
}

pub fn get_disk_info() -> Result<DiskStats, String> {
    let disks = Disks::new_with_refreshed_list();
    let root_disk = disks
        .list()
        .iter()
        .find(|d| d.mount_point() == Path::new("/"));

    if let Some(disk) = root_disk.or(disks.list().first()) {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total - available;

        Ok(DiskStats {
            total_bytes: total,
            used_bytes: used,
            free_bytes: available,
        })
    } else {
        Ok(DiskStats {
            total_bytes: 0,
            used_bytes: 0,
            free_bytes: 0,
        })
    }
}

pub fn get_system_info() -> Result<SystemStats, String> {
    let mut sys = SYSTEM_INSTANCE.lock().map_err(|e| e.to_string())?;

    sys.refresh_cpu_usage();
    sys.refresh_memory();
    sys.refresh_processes();

    let global_cpu = sys.global_cpu_info().cpu_usage();
    let total_mem = sys.total_memory();
    let used_mem = sys.used_memory();

    let mut processes: Vec<ProcessInfo> = sys
        .processes()
        .iter()
        .map(|(pid, process)| ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string(),
            cpu_usage: process.cpu_usage(),
            memory: process.memory(),
        })
        .collect();

    processes.sort_by(|a, b| {
        b.cpu_usage
            .partial_cmp(&a.cpu_usage)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    processes.truncate(50);

    Ok(SystemStats {
        cpu_usage: global_cpu,
        total_memory: total_mem,
        used_memory: used_mem,
        top_processes: processes,
    })
}

pub fn kill_process_by_pid(pid: u32) -> Result<(), String> {
    use std::process::Command;
    let mut success = false;

    // Attempt 1: Try using sysinfo
    {
        if let Ok(sys) = SYSTEM_INSTANCE.lock() {
            let sys_pid = Pid::from(pid as usize);

            if let Some(process) = sys.process(sys_pid) {
                success = process.kill();
            }
        }
    }

    if success {
        return Ok(());
    }

    // Attempt 2: Native Force Kill
    #[cfg(unix)]
    {
        let output = Command::new("kill")
            .args(["-9", &pid.to_string()])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            return Ok(());
        }
    }

    #[cfg(windows)]
    {
        let output = Command::new("taskkill")
            .args(["/F", "/PID", &pid.to_string()])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            return Ok(());
        }
    }

    Err("Failed to kill process".to_string())
}
EOF

# ============================================================================
# services/preview.rs - File preview generation
# ============================================================================
cat > services/preview.rs << 'EOF'
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use base64::{engine::general_purpose, Engine as _};

pub fn generate_file_preview(path: String) -> Result<String, String> {
    let path_obj = Path::new(&path);
    let ext = path_obj
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();
    let mut source_path: PathBuf;

    if ext == "app" {
        source_path = extract_app_icon(path_obj)?;
    } else if ["png", "jpg", "jpeg", "gif", "bmp", "webp", "tiff", "ico"].contains(&ext.as_str()) {
        source_path = path_obj.to_path_buf();
        if let Ok(metadata) = fs::metadata(&source_path) {
            if metadata.len() < 100 * 1024 {
                if let Ok(bytes) = fs::read(&source_path) {
                    return Ok(general_purpose::STANDARD.encode(bytes));
                }
            }
        }
    } else {
        return Err("No preview available".to_string());
    }

    convert_to_thumbnail(source_path)
}

fn extract_app_icon(app_path: &Path) -> Result<PathBuf, String> {
    let resources_path = app_path.join("Contents/Resources");
    let info_plist = app_path.join("Contents/Info.plist");
    let mut icon_name = "AppIcon.icns".to_string();

    if let Some(plist_str) = info_plist.to_str() {
        let clean_path = plist_str.trim_end_matches(".plist");
        if let Ok(out) = Command::new("defaults")
            .args(["read", clean_path, "CFBundleIconFile"])
            .output()
        {
            if out.status.success() {
                let out_name = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !out_name.is_empty() {
                    icon_name = out_name;
                    if !icon_name.ends_with(".icns") {
                        icon_name.push_str(".icns");
                    }
                }
            }
        }
    }

    let source_path = resources_path.join(icon_name);
    if !source_path.exists() {
        let fallback = resources_path.join("AppIcon.icns");
        if !fallback.exists() {
            return Err("App icon not found".to_string());
        }
        return Ok(fallback);
    }
    Ok(source_path)
}

fn convert_to_thumbnail(source_path: PathBuf) -> Result<String, String> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let temp_png = std::env::temp_dir().join(format!("thumb_{}.png", timestamp));

    let output = Command::new("sips")
        .args([
            "-s",
            "format",
            "png",
            "-Z",
            "128",
            source_path.to_str().unwrap(),
            "--out",
            temp_png.to_str().unwrap(),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("Conversion failed".to_string());
    }

    let bytes = fs::read(&temp_png).map_err(|e| e.to_string())?;
    let _ = fs::remove_file(temp_png);
    Ok(general_purpose::STANDARD.encode(bytes))
}
EOF

# ============================================================================
# services/mod.rs
# ============================================================================
cat > services/mod.rs << 'EOF'
pub mod filesystem;
pub mod preview;
pub mod system_info;
EOF

# ============================================================================
# commands/file_commands.rs
# ============================================================================
cat > commands/file_commands.rs << 'EOF'
use crate::models::{FileInfo, FolderStats};
use crate::services::filesystem::{read_directory_entries, get_stats_for_path};
use crate::services::preview::generate_file_preview;
use crate::cache::stats_cache::{get_cached_stats, cache_stats, save_cache_to_disk};

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<FileInfo>, String> {
    read_directory_entries(&path)
}

#[tauri::command]
pub fn get_folder_stats(path: String) -> Result<FolderStats, String> {
    let dir_path = if path.is_empty() {
        dirs::home_dir()
            .ok_or("No home")?
            .to_string_lossy()
            .to_string()
    } else {
        path.clone()
    };

    // Check cache first
    if let Some(cached) = get_cached_stats(&dir_path) {
        return Ok(cached);
    }

    // Calculate stats
    let stats = get_stats_for_path(&dir_path)?;

    // Cache results
    cache_stats(dir_path, stats.clone());
    save_cache_to_disk();

    Ok(stats)
}

#[tauri::command]
pub fn get_file_preview(path: String) -> Result<String, String> {
    generate_file_preview(path)
}

#[tauri::command]
pub fn open_file(path: String) -> Result<(), String> {
    open::that(path).map_err(|e| e.to_string())
}
EOF

# ============================================================================
# commands/system_commands.rs
# ============================================================================
cat > commands/system_commands.rs << 'EOF'
use crate::models::{QuickPaths, DiskStats, SystemStats};
use crate::services::system_info::{get_quick_paths_info, get_disk_info, get_system_info, kill_process_by_pid};

#[tauri::command]
pub fn get_quick_paths() -> Result<QuickPaths, String> {
    get_quick_paths_info()
}

#[tauri::command]
pub fn get_disk_stats() -> Result<DiskStats, String> {
    get_disk_info()
}

#[tauri::command]
pub fn get_system_stats() -> Result<SystemStats, String> {
    get_system_info()
}

#[tauri::command]
pub fn kill_process(pid: u32) -> Result<(), String> {
    kill_process_by_pid(pid)
}
EOF

# ============================================================================
# commands/cache_commands.rs
# ============================================================================
cat > commands/cache_commands.rs << 'EOF'
use crate::cache::stats_cache::{clear_cache, save_cache_to_disk};

#[tauri::command]
pub fn clear_stats_cache() -> Result<(), String> {
    clear_cache();
    save_cache_to_disk();
    Ok(())
}
EOF

# ============================================================================
# commands/mod.rs
# ============================================================================
cat > commands/mod.rs << 'EOF'
pub mod cache_commands;
pub mod file_commands;
pub mod system_commands;

pub use cache_commands::*;
pub use file_commands::*;
pub use system_commands::*;
EOF

# ============================================================================
# NEW lib.rs - Clean entry point
# ============================================================================
cat > lib.rs << 'EOF'
// Module declarations
mod models;
mod commands;
mod utils;
mod services;
mod cache;

use cache::stats_cache::load_cache_from_disk;
use commands::{file_commands, system_commands, cache_commands};
use std::thread;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load cache on startup
    load_cache_from_disk();

    // Initialize system instance
    let _ = services::system_info::SYSTEM_INSTANCE
        .lock()
        .map(|mut s| s.refresh_all());

    // Pre-cache common directories in background
    thread::spawn(|| {
        if let Ok(paths) = system_commands::get_quick_paths() {
            let _ = file_commands::get_folder_stats(paths.home);
            let _ = file_commands::get_folder_stats(paths.downloads);
            let _ = file_commands::get_folder_stats(paths.documents);
            let _ = file_commands::get_folder_stats(paths.desktop);
            let _ = file_commands::get_folder_stats(paths.pictures);
            let _ = file_commands::get_folder_stats(paths.movies);
        }
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            file_commands::read_directory,
            file_commands::open_file,
            file_commands::get_folder_stats,
            file_commands::get_file_preview,
            system_commands::get_quick_paths,
            system_commands::get_disk_stats,
            system_commands::get_system_stats,
            system_commands::kill_process,
            cache_commands::clear_stats_cache,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
EOF

cd ../..

echo ""
echo "✅ Rust backend refactored successfully!"
echo ""
echo "📁 New structure:"
echo "src-tauri/src/"
echo "├── models/          # Data structures"
echo "│   └── mod.rs"
echo "├── commands/        # Tauri commands"
echo "│   ├── file_commands.rs"
echo "│   ├── system_commands.rs"
echo "│   ├── cache_commands.rs"
echo "│   └── mod.rs"
echo "├── services/        # Business logic"
echo "│   ├── filesystem.rs"
echo "│   ├── preview.rs"
echo "│   ├── system_info.rs"
echo "│   └── mod.rs"
echo "├── utils/           # Helper functions"
echo "│   ├── file_helpers.rs"
echo "│   └── mod.rs"
echo "├── cache/           # Cache management"
echo "│   ├── stats_cache.rs"
echo "│   └── mod.rs"
echo "└── lib.rs           # Clean entry point (50 lines!)"
echo ""
echo "🎯 Benefits:"
echo "  ✅ Modular and maintainable"
echo "  ✅ Easy to test individual components"
echo "  ✅ Clear separation of concerns"
echo "  ✅ lib.rs reduced from 600+ to ~50 lines"
echo ""
echo "💾 Your original lib.rs is backed up as lib.rs.backup"
echo ""
echo "🚀 Build and test:"
echo "  cd src-tauri"
echo "  cargo build"
echo ""