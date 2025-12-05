import React, { useState } from "react";
import type { FileInfo } from "../../types";
import { FileIcon } from "../common/FileIcon";
import { getDisplayName } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";
import { ContextMenu, type MenuItem } from "../common/ContextMenu";
import { tauriService } from "../../services/tauriService";

interface FileGridProps {
  files: FileInfo[];
  handleNavigate: (path: string) => void;
  handleOpenFile: (path: string) => void;
  iconCache: Record<string, string>;
  refreshFiles: () => void; // Added refreshFiles prop
}

export const FileGrid = React.memo<FileGridProps>(({ files, handleNavigate, handleOpenFile, iconCache, refreshFiles }) => {
  const { theme } = useTheme();
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    file: FileInfo | null;
  }>({ visible: false, x: 0, y: 0, file: null });

  const handleContextMenu = (e: React.MouseEvent, file: FileInfo) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, file });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const menuItems: MenuItem[] = contextMenu.file
    ? [
        { label: "Open", action: () => contextMenu.file && (contextMenu.file.is_dir ? handleNavigate(contextMenu.file.path) : handleOpenFile(contextMenu.file.path)) },
        { label: "Open with...", action: () => contextMenu.file && handleOpenFile(contextMenu.file.path) },
        { label: "Show in folder", action: async () => {
          if (contextMenu.file) {
            await tauriService.showInFolder(contextMenu.file.path);
          }
        } },
        { label: "Copy", action: () => console.log("Copy"), separator: true }, // TODO: Implement copy
        { label: "Cut", action: () => console.log("Cut") }, // TODO: Implement cut
        { label: "Rename", action: async () => {
          if (contextMenu.file) {
            const oldPath = contextMenu.file.path;
            const oldName = contextMenu.file.name;
            const newName = window.prompt(`Rename '${oldName}' to:`, oldName);
            if (newName && newName !== oldName) {
              const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/"));
              const newPath = `${parentPath}/${newName}`;
              console.log("Renaming:", { oldPath, newName, newPath });
              try {
                await tauriService.renamePath(oldPath, newPath);
                refreshFiles();
                console.log("Rename successful!");
              } catch (e) {
                console.error("Rename failed:", e);
                alert(`Failed to rename: ${e}`);
              }
            }
          }
        }, separator: true },
        { label: "Duplicate", action: async () => {
          if (contextMenu.file) {
            await tauriService.duplicatePath(contextMenu.file.path);
            refreshFiles();
          }
        } },
        { label: "Delete", action: async () => {
          if (contextMenu.file) {
            // In a real application, you'd want a confirmation dialog here.
            await tauriService.deletePath(contextMenu.file.path);
            refreshFiles();
          }
        } },
        { label: "Properties", action: () => console.log("Properties"), separator: true }, // TODO: Implement properties
      ]
    : [];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10">
        {files.map((file: FileInfo) => (
          <div
            key={file.path}
            onClick={() => file.is_dir && handleNavigate(file.path)}
            onDoubleClick={() => !file.is_dir && handleOpenFile(file.path)}
            onContextMenu={(e) => handleContextMenu(e, file)}
            className={`group flex flex-col items-center p-4 rounded-2xl border border-transparent transition-all cursor-pointer ${
              theme === "light"
                ? "hover:bg-white hover:shadow-sm hover:border-gray-100"
                : "hover:bg-gray-700 hover:shadow-sm hover:border-gray-600"
            }`}
            title={file.name}
          >
            <div className="w-12 h-12 mb-2 flex items-center justify-center transition-transform group-hover:scale-105">
              <FileIcon file={file} size={48} iconData={iconCache[file.path]} />
            </div>
            <span
              className={`text-xs text-center font-medium line-clamp-2 break-words w-full px-1 leading-tight ${
                theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
            >
              {getDisplayName(file.name, file.extension)}
            </span>
            <span
              className={`text-[10px] mt-0.5 ${
                theme === "light" ? "text-gray-400" : "text-gray-400"
              }`}
            >
              {file.is_dir ? "" : (file.size / 1024).toFixed(0) + " KB"}
            </span>
          </div>
        ))}
      </div>
      {contextMenu.visible && <ContextMenu items={menuItems} x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />}
    </>
  );
});
