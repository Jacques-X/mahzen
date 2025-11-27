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
