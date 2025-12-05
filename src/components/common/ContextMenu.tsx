import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface MenuItem {
  label: string;
  action: () => void;
  separator?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, x, y, onClose }) => {
  const { theme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: y, left: x });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;

      let newX = x;
      let newY = y;

      if (x + menuWidth > innerWidth) {
        newX = innerWidth - menuWidth - 10;
      }

      if (y + menuHeight > innerHeight) {
        newY = innerHeight - menuHeight - 10;
      }
      setMenuPosition({ top: newY, left: newX });
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 rounded-xl shadow-lg border ${
        theme === 'light'
          ? 'bg-white/80 border-gray-200/80 backdrop-blur-md'
          : 'bg-gray-800/80 border-gray-700/80 backdrop-blur-md'
      }`}
      style={{ top: menuPosition.top, left: menuPosition.left }}
    >
      <ul className="py-2">
        {items.map((item, index) => (
          <li key={index}>
            {item.separator && (
              <div
                className={`border-t my-1 ${
                  theme === 'light' ? 'border-gray-200' : 'border-gray-600'
                }`}
              />
            )}
            <button
              onClick={() => {
                item.action();
                onClose();
              }}
              className={`w-full text-left px-5 py-1.5 text-sm flex items-center transition-colors duration-150 ${
                theme === 'light'
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-200 hover:bg-gray-700'
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
