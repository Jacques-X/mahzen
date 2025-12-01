// Module declarations
mod models;
mod commands;
mod utils;
mod services;
mod cache;

use cache::stats_cache::{load_cache_from_disk, save_cache_to_disk};
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
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                save_cache_to_disk();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
