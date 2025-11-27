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
