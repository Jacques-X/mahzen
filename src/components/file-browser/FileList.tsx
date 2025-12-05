import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import type { FileInfo } from "../../types";
import { FileIcon } from "../common/FileIcon";
import { getDisplayName } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";
import { ContextMenu, type MenuItem } from "../common/ContextMenu";
import { tauriService } from "../../services/tauriService";

interface FileListProps {
  files: FileInfo[];
  handleNavigate: (path: string) => void;
  handleOpenFile: (path: string) => void;
  iconCache: Record<string, string>;
  refreshFiles: () => void; // Added refreshFiles prop
}

export const FileList = React.memo<FileListProps>(({ files, handleNavigate, handleOpenFile, iconCache, refreshFiles }) => {
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
            const newName = window.prompt(`Rename \'${oldName}\' to:`, oldName);
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
            // In a real application, you\'d want a confirmation dialog here.
            await tauriService.deletePath(contextMenu.file.path);
            refreshFiles();
          }
        } },
        { label: "Properties", action: () => console.log("Properties"), separator: true }, // TODO: Implement properties
      ]
    : [];

  return (
    <>
      <div className={`${
        theme === "light" ? "bg-white border-gray-100" : "bg-gray-800 border-gray-700"
      } rounded-2xl shadow-sm border overflow-hidden mb-10`}>
        <table className="w-full text-left">
          <thead className={`text-xs font-medium border-b sticky top-0 z-10 backdrop-blur-sm ${
            theme === "light" ? "text-gray-400 bg-gray-50/80 border-gray-100" : "text-gray-500 bg-gray-700/80 border-gray-600"
          }`}>
            <tr>
              <th className="py-3 pl-6 font-normal w-1/2">Name</th>
              <th className="py-3 font-normal hidden sm:table-cell">Size</th>
              <th className="py-3 font-normal hidden md:table-cell">Modified</th>
              <th className="py-3 pr-6"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {files.map((file: FileInfo) => (
              <tr
                key={file.path}
                onClick={() => file.is_dir && handleNavigate(file.path)}
                onDoubleClick={() => !file.is_dir && handleOpenFile(file.path)}
                onContextMenu={(e) => handleContextMenu(e, file)}
                className={`${
                  theme === "light"
                    ? "hover:bg-gray-50 border-gray-50"
                    : "hover:bg-gray-700 border-gray-700"
                } transition-colors group border-b last:border-none cursor-pointer`}
              >
                <td className="py-2 pl-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <FileIcon file={file} size={20} iconData={iconCache[file.path]} />
                    </div>
                    <span className={`font-medium truncate max-w-[300px] ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    }`}>
                      {getDisplayName(file.name, file.extension)}
                    </span>
                  </div>
                </td>
                <td className={`py-2 hidden sm:table-cell text-xs ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}>
                  {file.is_dir ? "--" : (file.size / 1024).toFixed(1) + " KB"}
                </td>
                <td className={`py-2 text-xs hidden md:table-cell ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}>
                  {new Date(file.last_modified * 1000).toLocaleDateString()}
                </td>
                <td className="py-2 pr-6 text-right">
                  <MoreVertical size={16} className={`cursor-pointer inline ${
                    theme === "light" ? "text-gray-300 group-hover:text-gray-500" : "text-gray-600 group-hover:text-gray-400"
                  }`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {contextMenu.visible && <ContextMenu items={menuItems} x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />}
    </>
  );
});
