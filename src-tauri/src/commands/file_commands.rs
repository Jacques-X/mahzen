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
