use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use crate::models::FolderStats;

pub static STATS_CACHE: Mutex<Option<HashMap<String, FolderStats>>> = Mutex::new(None);

fn get_cache_path() -> Option<PathBuf> {
    dirs::data_local_dir().map(|d| d.join("trove").join("folder_stats_cache.json"))
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
