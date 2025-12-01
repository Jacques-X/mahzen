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

fn calculate_total_size_recursive(path: &Path) -> u64 {
    let mut total = 0;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            if entry_path.is_symlink() {
                if let Ok(meta) = fs::metadata(&entry_path) {
                    total += meta.len();
                }
                continue;
            }
            if entry_path.is_dir() {
                total += calculate_total_size_recursive(&entry_path);
            } else if let Ok(meta) = fs::metadata(&entry_path) {
                total += meta.len();
            }
        }
    }
    total
}

pub fn get_stats_for_path(path: &str) -> Result<FolderStats, String> {
    let path_obj = Path::new(path);
    
    // Calculate total size first
    let total_size = calculate_total_size_recursive(path_obj);
    
    // Now categorize files for breakdown
    let mut stats = FolderStats {
        total_size,
        file_count: 0,
        folder_count: 0,
        breakdown: FileTypeBreakdown::default(),
    };

    categorize_files_recursive(path_obj, &mut stats);
    Ok(stats)
}

fn categorize_files_recursive(path: &Path, stats: &mut FolderStats) {
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
                    categorize_files_recursive(&entry_path, stats);
                } else if is_bundle_type {
                    stats.file_count += 1;
                    let bundle_size = calculate_dir_size_recursive(&entry_path);
                    stats.breakdown.apps += bundle_size;
                } else {
                    stats.file_count += 1;
                    let size = metadata.len();

                    let category = get_file_type_category(&extension);
                    match category {
                        "documents" => stats.breakdown.documents += size,
                        "photos" => stats.breakdown.photos += size,
                        "videos" => stats.breakdown.videos += size,
                        "audio" => stats.breakdown.audio += size,
                        "apps" => stats.breakdown.apps += size,
                        "archives" => stats.breakdown.archives += size,
                        _ => stats.breakdown.other += size,
                    }
                }
            }
        }
    }
}
