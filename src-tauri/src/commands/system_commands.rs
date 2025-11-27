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
