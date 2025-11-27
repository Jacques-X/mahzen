use crate::cache::stats_cache::{clear_cache, save_cache_to_disk};

#[tauri::command]
pub fn clear_stats_cache() -> Result<(), String> {
    clear_cache();
    save_cache_to_disk();
    Ok(())
}
