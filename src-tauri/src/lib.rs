use std::fs;
use std::process::Command;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use sysinfo::{Disks, System, Pid}; 
use base64::{Engine as _, engine::general_purpose};
use std::collections::HashMap;
use std::sync::Mutex;
use std::thread;

// --- Data Structures ---

#[derive(serde::Serialize, Debug)]
struct FileInfo {
    name: String,
    path: String,
    is_dir: bool,
    size: u64,
    last_modified: u64,
    extension: String,
}

#[derive(serde::Serialize, Debug)]
struct QuickPaths {
    home: String,
    desktop: String,
    documents: String,
    downloads: String,
    movies: String,
    pictures: String,
}

#[derive(serde::Serialize, Debug)]
struct DiskStats {
    total_bytes: u64,
    used_bytes: u64,
    free_bytes: u64,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
struct FolderStats {
    total_size: u64,
    file_count: u64,
    folder_count: u64,
    breakdown: FileTypeBreakdown,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Default)]
struct FileTypeBreakdown {
    documents: u64,
    photos: u64,
    videos: u64,
    audio: u64,
    apps: u64,
    other: u64,
}

#[derive(serde::Serialize, Debug, Clone)]
struct ProcessInfo {
    pid: u32,
    name: String,
    cpu_usage: f32,
    memory: u64,
}

#[derive(serde::Serialize, Debug, Clone)]
struct SystemStats {
    cpu_usage: f32,
    total_memory: u64,
    used_memory: u64,
    top_processes: Vec<ProcessInfo>,
}

// Global cache for folder statistics
static STATS_CACHE: Mutex<Option<HashMap<String, FolderStats>>> = Mutex::new(None);

// Global System instance
lazy_static::lazy_static! {
    static ref SYSTEM_INSTANCE: Mutex<System> = Mutex::new(System::new_all());
}

// --- Helper Functions ---

fn get_cache_path() -> Option<PathBuf> {
    dirs::data_local_dir().map(|d| d.join("mahzen").join("folder_stats_cache.json"))
}

fn load_cache_from_disk() {
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

fn save_cache_to_disk() {
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

fn get_file_type_category(extension: &str) -> &str {
    let ext = extension.to_lowercase();
    match ext.as_str() {
        "pdf" | "doc" | "docx" | "txt" | "md" | "rtf" | "odt" | "pages" | "tex" | "wpd" | "ods" | "xlr" | "xls" | "xlsx" | "csv" | "ppt" | "pptx" | "odp" | "key" | "epub" | "mobi" | "azw" | "azw3" | "djvu" | "xps" | "oxps" | "ps" | "log" | "msg" | "eml" | "vcf" | "ics" => "documents",
        "jpg" | "jpeg" | "png" | "gif" | "svg" | "webp" | "bmp" | "tiff" | "tif" | "ico" | "heic" | "heif" | "raw" | "cr2" | "nef" | "orf" | "sr2" | "arw" | "dng" | "psd" | "ai" | "xcf" | "sketch" | "fig" | "indd" | "eps" | "svgz" | "jfif" | "jp2" | "jpx" | "apng" | "avif" | "jxl" => "photos",
        "mp4" | "mov" | "avi" | "mkv" | "webm" | "flv" | "wmv" | "m4v" | "mpg" | "mpeg" | "3gp" | "3g2" | "f4v" | "swf" | "vob" | "ogv" | "gifv" | "mts" | "m2ts" | "ts" | "qt" | "yuv" | "rm" | "rmvb" | "asf" | "amv" | "divx" | "mxf" => "videos",
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" | "wma" | "opus" | "oga" | "mogg" | "ape" | "alac" | "aiff" | "aif" | "aifc" | "au" | "ra" | "ram" | "voc" | "amr" | "awb" | "dss" | "dvf" | "m4b" | "m4p" | "mid" | "midi" | "mka" | "mlp" | "mpc" | "tta" | "vox" | "wv" => "audio",
        "app" | "exe" | "dmg" | "pkg" | "deb" | "rpm" | "apk" | "ipa" | "msi" | "appx" | "appimage" | "snap" | "flatpak" | "bin" | "run" | "bundle" | "command" => "apps",
        _ => "other"
    }
}

fn calculate_dir_size_recursive(path: &Path) -> u64 {
    let mut total = 0;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_symlink() { 
                if let Ok(meta) = fs::metadata(&path) { total += meta.len(); }
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

fn calculate_folder_stats_deep(path: &Path, stats: &mut FolderStats) {
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let is_symlink = entry_path.is_symlink();

            if let Ok(metadata) = entry.metadata() {
                let extension = entry_path.extension().unwrap_or_default().to_string_lossy().to_string();
                let is_bundle = extension == "app" || extension == "framework" || extension == "plugin";
                
                if metadata.is_dir() && !is_bundle && !is_symlink {
                    stats.folder_count += 1;
                    calculate_folder_stats_deep(&entry_path, stats);
                } else if is_bundle {
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

// --- Commands ---

#[tauri::command]
fn get_system_stats() -> Result<SystemStats, String> {
    let mut sys = SYSTEM_INSTANCE.lock().map_err(|e| e.to_string())?;
    
    sys.refresh_cpu_usage();
    sys.refresh_memory();
    sys.refresh_processes(); 

    let global_cpu = sys.global_cpu_info().cpu_usage();
    let total_mem = sys.total_memory();
    let used_mem = sys.used_memory();

    let mut processes: Vec<ProcessInfo> = sys.processes().iter()
        .map(|(pid, process)| ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string(), 
            cpu_usage: process.cpu_usage(),
            memory: process.memory(),
        })
        .collect();

    processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap_or(std::cmp::Ordering::Equal));
    
    // Increased to 50 items so scrolling works
    processes.truncate(50); 

    Ok(SystemStats {
        cpu_usage: global_cpu,
        total_memory: total_mem,
        used_memory: used_mem,
        top_processes: processes,
    })
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<(), String> {
    let mut success = false;
    
    // Attempt 1: Try using sysinfo (Standard way)
    {
        if let Ok(mut sys) = SYSTEM_INSTANCE.lock() {
            // Sysinfo generally expects usize for Pid on Unix
            let sys_pid = Pid::from(pid as usize); 
            
            if let Some(process) = sys.process(sys_pid) {
                success = process.kill();
            }
        }
    }

    if success {
        return Ok(());
    }

    // Attempt 2: Native Force Kill (Fallback if permission denied or not in cache)
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

#[tauri::command]
fn get_quick_paths() -> Result<QuickPaths, String> {
    let home = dirs::home_dir().unwrap_or_default().to_string_lossy().to_string();
    let desktop = dirs::desktop_dir().unwrap_or_default().to_string_lossy().to_string();
    let documents = dirs::document_dir().unwrap_or_default().to_string_lossy().to_string();
    let downloads = dirs::download_dir().unwrap_or_default().to_string_lossy().to_string();
    let movies = dirs::video_dir().unwrap_or_default().to_string_lossy().to_string();
    let pictures = dirs::picture_dir().unwrap_or_default().to_string_lossy().to_string();

    Ok(QuickPaths {
        home,
        desktop,
        documents,
        downloads,
        movies,
        pictures
    })
}

#[tauri::command]
fn get_disk_stats() -> Result<DiskStats, String> {
    let disks = Disks::new_with_refreshed_list();
    let root_disk = disks.list().iter().find(|d| d.mount_point() == Path::new("/"));
    
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
        Ok(DiskStats { total_bytes: 0, used_bytes: 0, free_bytes: 0 })
    }
}

#[tauri::command]
fn get_folder_stats(path: String) -> Result<FolderStats, String> {
    let dir_path = if path.is_empty() {
        dirs::home_dir().ok_or("No home")?.to_string_lossy().to_string()
    } else {
        path.clone()
    };

    let cache = STATS_CACHE.lock().unwrap();
    if let Some(ref cache_map) = *cache {
        if let Some(cached_stats) = cache_map.get(&dir_path) {
            return Ok(cached_stats.clone());
        }
    }
    drop(cache);

    let path_obj = Path::new(&dir_path);
    let mut stats = FolderStats {
        total_size: 0,
        file_count: 0,
        folder_count: 0,
        breakdown: FileTypeBreakdown::default(),
    };

    calculate_folder_stats_deep(path_obj, &mut stats);

    let mut cache = STATS_CACHE.lock().unwrap();
    if cache.is_none() {
        *cache = Some(HashMap::new());
    }
    if let Some(ref mut cache_map) = *cache {
        cache_map.insert(dir_path, stats.clone());
    }
    drop(cache);

    save_cache_to_disk();

    Ok(stats)
}

#[tauri::command]
fn clear_stats_cache() -> Result<(), String> {
    let mut cache = STATS_CACHE.lock().unwrap();
    *cache = Some(HashMap::new());
    drop(cache);
    save_cache_to_disk();
    Ok(())
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileInfo>, String> {
    let dir_path = if path.is_empty() {
        dirs::home_dir().ok_or("No home")?.to_string_lossy().to_string()
    } else {
        path
    };

    let entries = fs::read_dir(&dir_path).map_err(|e| e.to_string())?;
    let mut files: Vec<FileInfo> = Vec::new();

    for entry in entries.flatten() {
        let path_buf = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        
        if name.starts_with('.') { continue; }

        let extension = path_buf.extension().unwrap_or_default().to_string_lossy().to_string();
        let is_bundle = extension == "app" || extension == "framework" || extension == "plugin";
        let metadata = fs::metadata(&path_buf).unwrap_or_else(|_| entry.metadata().unwrap());
        let is_dir = if is_bundle { false } else { metadata.is_dir() };

        files.push(FileInfo {
            name,
            path: path_buf.to_string_lossy().to_string(),
            is_dir,
            size: metadata.len(),
            last_modified: metadata.modified().unwrap_or(SystemTime::now())
                .duration_since(UNIX_EPOCH).unwrap_or_default().as_secs(),
            extension,
        });
    }

    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(files)
}

#[tauri::command]
fn get_file_preview(path: String) -> Result<String, String> {
    let path_obj = Path::new(&path);
    let ext = path_obj.extension().unwrap_or_default().to_string_lossy().to_lowercase();
    let mut source_path: PathBuf;

    if ext == "app" {
        let resources_path = path_obj.join("Contents/Resources");
        let info_plist = path_obj.join("Contents/Info.plist");
        let mut icon_name = "AppIcon.icns".to_string();

        if let Some(plist_str) = info_plist.to_str() {
            let clean_path = plist_str.trim_end_matches(".plist");
            if let Ok(out) = Command::new("defaults").args(["read", clean_path, "CFBundleIconFile"]).output() {
                if out.status.success() {
                    let out_name = String::from_utf8_lossy(&out.stdout).trim().to_string();
                    if !out_name.is_empty() {
                        icon_name = out_name;
                        if !icon_name.ends_with(".icns") { icon_name.push_str(".icns"); }
                    }
                }
            }
        }
        source_path = resources_path.join(icon_name);
        if !source_path.exists() {
            let fallback = resources_path.join("AppIcon.icns");
            if !fallback.exists() { return Err("App icon not found".to_string()); }
            source_path = fallback;
        }
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

    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    let temp_png = std::env::temp_dir().join(format!("thumb_{}.png", timestamp));

    let output = Command::new("sips")
        .args(["-s", "format", "png", "-Z", "128", source_path.to_str().unwrap(), "--out", temp_png.to_str().unwrap()])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() { return Err("Conversion failed".to_string()); }
    let bytes = fs::read(&temp_png).map_err(|e| e.to_string())?;
    let _ = fs::remove_file(temp_png);
    Ok(general_purpose::STANDARD.encode(bytes))
}

#[tauri::command]
fn open_file(path: String) -> Result<(), String> {
    open::that(path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    load_cache_from_disk();
    
    let _ = SYSTEM_INSTANCE.lock().map(|mut s| s.refresh_all());

    thread::spawn(|| {
        if let Ok(paths) = get_quick_paths() {
            let _ = get_folder_stats(paths.home);
            let _ = get_folder_stats(paths.downloads);
            let _ = get_folder_stats(paths.documents);
            let _ = get_folder_stats(paths.desktop);
            let _ = get_folder_stats(paths.pictures);
            let _ = get_folder_stats(paths.movies);
        }
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_directory, 
            open_file, 
            get_quick_paths, 
            get_disk_stats,
            get_folder_stats,
            clear_stats_cache,
            get_file_preview,
            get_system_stats,
            kill_process
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}