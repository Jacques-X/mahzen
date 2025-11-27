use std::fs;
use std::path::Path;

pub fn get_file_type_category(extension: &str) -> &str {
    let ext = extension.to_lowercase();
    match ext.as_str() {
        "pdf" | "doc" | "docx" | "txt" | "md" | "rtf" | "odt" | "pages" | "tex" | "wpd" 
        | "ods" | "xlr" | "xls" | "xlsx" | "csv" | "ppt" | "pptx" | "odp" | "key" 
        | "epub" | "mobi" | "azw" | "azw3" | "djvu" | "xps" | "oxps" | "ps" | "log" 
        | "msg" | "eml" | "vcf" | "ics" => "documents",
        
        "jpg" | "jpeg" | "png" | "gif" | "svg" | "webp" | "bmp" | "tiff" | "tif" 
        | "ico" | "heic" | "heif" | "raw" | "cr2" | "nef" | "orf" | "sr2" | "arw" 
        | "dng" | "psd" | "ai" | "xcf" | "sketch" | "fig" | "indd" | "eps" | "svgz" 
        | "jfif" | "jp2" | "jpx" | "apng" | "avif" | "jxl" => "photos",
        
        "mp4" | "mov" | "avi" | "mkv" | "webm" | "flv" | "wmv" | "m4v" | "mpg" 
        | "mpeg" | "3gp" | "3g2" | "f4v" | "swf" | "vob" | "ogv" | "gifv" | "mts" 
        | "m2ts" | "ts" | "qt" | "yuv" | "rm" | "rmvb" | "asf" | "amv" | "divx" 
        | "mxf" => "videos",
        
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" | "wma" | "opus" | "oga" 
        | "mogg" | "ape" | "alac" | "aiff" | "aif" | "aifc" | "au" | "ra" | "ram" 
        | "voc" | "amr" | "awb" | "dss" | "dvf" | "m4b" | "m4p" | "mid" | "midi" 
        | "mka" | "mlp" | "mpc" | "tta" | "vox" | "wv" => "audio",
        
        "app" | "exe" | "dmg" | "pkg" | "deb" | "rpm" | "apk" | "ipa" | "msi" 
        | "appx" | "appimage" | "snap" | "flatpak" | "bin" | "run" | "bundle" 
        | "command" => "apps",
        
        _ => "other"
    }
}

pub fn calculate_dir_size_recursive(path: &Path) -> u64 {
    let mut total = 0;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_symlink() {
                if let Ok(meta) = fs::metadata(&path) {
                    total += meta.len();
                }
                continue;
            }

            if path.is_dir() {
                total += calculate_dir_size_recursive(&path);
            } else if let Ok(meta) = fs::metadata(&path) {
                total += meta.len();
            }
        }
    }
    total
}

pub fn is_bundle(extension: &str) -> bool {
    matches!(extension, "app" | "framework" | "plugin")
}
