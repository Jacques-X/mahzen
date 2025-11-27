use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use base64::{engine::general_purpose, Engine as _};

pub fn generate_file_preview(path: String) -> Result<String, String> {
    let path_obj = Path::new(&path);
    let ext = path_obj
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();
    let mut source_path: PathBuf;

    if ext == "app" {
        source_path = extract_app_icon(path_obj)?;
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

    convert_to_thumbnail(source_path)
}

fn extract_app_icon(app_path: &Path) -> Result<PathBuf, String> {
    let resources_path = app_path.join("Contents/Resources");
    let info_plist = app_path.join("Contents/Info.plist");
    let mut icon_name = "AppIcon.icns".to_string();

    if let Some(plist_str) = info_plist.to_str() {
        let clean_path = plist_str.trim_end_matches(".plist");
        if let Ok(out) = Command::new("defaults")
            .args(["read", clean_path, "CFBundleIconFile"])
            .output()
        {
            if out.status.success() {
                let out_name = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !out_name.is_empty() {
                    icon_name = out_name;
                    if !icon_name.ends_with(".icns") {
                        icon_name.push_str(".icns");
                    }
                }
            }
        }
    }

    let source_path = resources_path.join(icon_name);
    if !source_path.exists() {
        let fallback = resources_path.join("AppIcon.icns");
        if !fallback.exists() {
            return Err("App icon not found".to_string());
        }
        return Ok(fallback);
    }
    Ok(source_path)
}

fn convert_to_thumbnail(source_path: PathBuf) -> Result<String, String> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let temp_png = std::env::temp_dir().join(format!("thumb_{}.png", timestamp));

    let output = Command::new("sips")
        .args([
            "-s",
            "format",
            "png",
            "-Z",
            "128",
            source_path.to_str().unwrap(),
            "--out",
            temp_png.to_str().unwrap(),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("Conversion failed".to_string());
    }

    let bytes = fs::read(&temp_png).map_err(|e| e.to_string())?;
    let _ = fs::remove_file(temp_png);
    Ok(general_purpose::STANDARD.encode(bytes))
}
