import React from 'react';
import { tauriService } from '../../services/tauriService';

export const WindowControls: React.FC = () => {
  const handleClose = async () => {
    try {
      await tauriService.window.close();
    } catch (e) {
      console.error('Failed to close window', e);
    }
  };

  const handleMinimize = async () => {
    try {
      await tauriService.window.minimize();
    } catch (e) {
      console.error('Failed to minimize window', e);
    }
  };

  const handleMaximize = async () => {
    try {
      await tauriService.window.toggleMaximize();
    } catch (e) {
      console.error('Failed to maximize window', e);
    }
  };

  return (
    <div data-tauri-drag-region className="px-5 pt-5 pb-2 flex items-center space-x-2 select-none">
      <div
        onClick={handleClose}
        className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] hover:bg-[#FF5F57]/80 cursor-pointer shadow-sm"
      />
      <div
        onClick={handleMinimize}
        className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:bg-[#FFBD2E]/80 cursor-pointer shadow-sm"
      />
      <div
        onClick={handleMaximize}
        className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] hover:bg-[#28C840]/80 cursor-pointer shadow-sm"
      />
    </div>
  );
};
