import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavItem = React.memo<NavItemProps>(({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group mb-0.5 ${
      active ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`}
  >
    <div className="flex items-center space-x-3">
      <span className={active ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}>{icon}</span>
      <span className={`text-sm font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </div>
  </div>
));
