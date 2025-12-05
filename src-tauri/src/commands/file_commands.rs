use std::path::Path;
use crate::models::{FileInfo, FolderStats};
use crate::services::filesystem::{read_directory_entries, get_stats_for_path, copy_dir_all};
use crate::services::preview::generate_file_preview;
use crate::cache::stats_cache::{get_cached_stats, cache_stats, save_cache_to_disk};
use trash::delete;

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

#[tauri::command]
pub fn delete_path(path: String) -> Result<(), String> {
    delete(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn duplicate_path(path: String) -> Result<(), String> {
    let original_path = Path::new(&path);
    let parent_dir = original_path.parent().ok_or("Invalid path")?;
    let file_stem = original_path.file_stem().ok_or("Invalid file name")?.to_string_lossy();
    let extension = original_path.extension().map_or("".to_string(), |ext| format!(".{}", ext.to_string_lossy()));

    let mut new_path_str = format!("{}/{}-copy{}", parent_dir.to_string_lossy(), file_stem, extension);
    let mut counter = 1;
    while Path::new(&new_path_str).exists() {
        new_path_str = format!("{}/{}-copy({}){}", parent_dir.to_string_lossy(), file_stem, counter, extension);
        counter += 1;
    }

    let new_path = Path::new(&new_path_str);

    if original_path.is_file() {
        std::fs::copy(original_path, new_path)
            .map(|_| ()) // map to () to satisfy Result<(), String>
            .map_err(|e| e.to_string())
    } else if original_path.is_dir() {
        copy_dir_all(original_path, new_path)
    } else {
        Err("Path is neither a file nor a directory".to_string())
    }
}

#[tauri::command]
pub fn rename_path(old_path: String, new_path: String) -> Result<(), String> {
    std::fs::rename(old_path, new_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn show_in_folder(path: String) -> Result<(), String> {
    let path_obj = Path::new(&path);
    if let Some(parent) = path_obj.parent() {
        open::that(parent).map_err(|e| e.to_string())
    } else {
        Err("Could not get parent directory".to_string())
    }
}
