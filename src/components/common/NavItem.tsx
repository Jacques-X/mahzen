import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavItem = React.memo<NavItemProps>(({ icon, label, active, onClick }) => {
  const { theme } = useTheme();
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group mb-0.5 ${
        active
          ? (theme === 'light' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'bg-purple-900/30 text-purple-300 shadow-sm')
          : (theme === 'light' ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200')
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className={
          active
            ? 'text-purple-600'
            : (theme === 'light' ? 'text-gray-400 group-hover:text-gray-600' : 'text-gray-500 group-hover:text-gray-300')
        }>{icon}</span>
        <span className={`text-sm font-medium ${active ? 'font-bold' : ''} ${
          active
            ? (theme === 'light' ? '' : 'text-white')
            : (theme === 'light' ? '' : 'text-gray-300 group-hover:text-gray-100')
        }`}>{label}</span>
      </div>
    </div>
  );
});
