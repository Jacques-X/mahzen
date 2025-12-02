import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Database,
  HardDrive,
  Info,
  ChevronRight,
  Volume2,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SettingCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SettingsViewProps {}

export const SettingsView = ({}: SettingsViewProps) => {
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('appearance'); // Set default to appearance
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScan, setAutoScan] = useState(true);
  const [scanInterval, setScanInterval] = useState('30');

  const categories: SettingCategory[] = [
    { id: 'appearance', name: 'Appearance', icon: <Moon size={20} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={20} /> },
    { id: 'storage', name: 'Storage', icon: <HardDrive size={20} /> },
    { id: 'about', name: 'About', icon: <Info size={20} /> },
  ];

  return (
    <div className={`flex h-full w-full rounded-3xl shadow-xl border transition-colors ${
      theme === 'light' ? 'bg-[#F9FAFB] border-gray-200/60' : 'bg-gray-900 border-gray-700/60'
    }`}>
      {/* Sidebar */}
      <div className={`w-64 border-r flex flex-col transition-colors ${
        theme === 'light' ? 'bg-white border-gray-200/60' : 'bg-gray-800 border-gray-700/60'
      }`}>
        <div className={`p-6 border-b transition-colors ${
          theme === 'light' ? 'border-gray-100' : 'border-gray-700'
        }`}>
          <div className="flex items-center gap-3">
            <Settings size={24} className={theme === 'light' ? 'text-purple-500' : 'text-purple-400'} />
            <h1 className={`text-xl font-semibold transition-colors ${
              theme === 'light' ? 'text-purple-500' : 'text-purple-400'
            }`}>Settings</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors 
                ${selectedCategory === category.id
                  ? (theme === 'light' ? 'bg-purple-50 text-purple-500 font-medium' : 'bg-purple-950/30 text-purple-400 font-medium')
                  : (theme === 'light' ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-gray-700')
                }`}
            >
              <div className="flex-shrink-0">{category.icon}</div>
              <span className="flex-1 text-left">{category.name}</span>
              <ChevronRight
                size={16}
                className={`flex-shrink-0 transition-opacity ${
                  selectedCategory === category.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          ))}
        </div>

        <div className={`p-4 border-t text-xs transition-colors ${
          theme === 'light' ? 'border-gray-100 text-gray-500' : 'border-gray-700 text-gray-400'
        }`}>
          <p>Version 1.0.0</p>
          <p>© 2025 Trove</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        {selectedCategory === 'appearance' && (
          <div className="w-full">
            <h2 className={`text-2xl font-bold mb-6 transition-colors ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>Appearance</h2>

            <div className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  {theme === 'light' ? (
                    <Sun size={20} className="text-yellow-500" />
                  ) : (
                    <Moon size={20} className="text-purple-500" />
                  )}
                  <div>
                    <h3 className={`font-medium transition-colors ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Dark Mode
                    </h3>
                    <p className={`text-sm transition-colors ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Toggle between light and dark themes
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-purple-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600')
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedCategory === 'notifications' && (
          <div className="w-full">
            <h2 className={`text-2xl font-bold mb-6 transition-colors ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>Notifications</h2>

            <div className="space-y-6">
              {/* Enable notifications */}
              <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-600" />
                  <div>
                    <h3 className={`font-medium transition-colors ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Enable Notifications
                    </h3>
                    <p className={`text-sm transition-colors ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Receive alerts for important events
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-purple-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600')
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Sound */}
              <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <Volume2 size={20} className="text-gray-600" />
                  <div>
                    <h3 className={`font-medium transition-colors ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>Notification Sound</h3>
                    <p className={`text-sm transition-colors ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Play sound for notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  disabled={!notifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled && notifications ? 'bg-purple-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600')
                  } ${!notifications ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled && notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedCategory === 'storage' && (
          <div className="w-full">
            <h2 className={`text-2xl font-bold mb-6 transition-colors ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>Storage</h2>

            <div className="space-y-6">
              {/* Auto scan */}
              <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-gray-600" />
                  <div>
                    <h3 className={`font-medium transition-colors ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Automatic Scanning
                    </h3>
                    <p className={`text-sm transition-colors ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Automatically scan folders for changes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoScan(!autoScan)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoScan ? 'bg-purple-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600')
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoScan ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Scan interval */}
              {autoScan && (
                <div className={`p-4 rounded-lg border transition-colors ${
                  theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
                }`}>
                  <label className="block mb-2">
                    <span className={`text-sm font-medium transition-colors ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Scan Interval (seconds)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={scanInterval}
                    onChange={(e) => setScanInterval(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors ${
                      theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-600 bg-gray-900 text-white'
                    }`}
                  />
                  <p className={`text-xs mt-2 transition-colors ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Interval between automatic folder scans
                  </p>
                </div>
              )}

              {/* Cache info */}
              <div className={`p-4 rounded-lg border transition-colors ${
                theme === 'light' ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/20 border-purple-950'
              }`}>
                <h4 className={`font-medium mb-2 transition-colors ${
                  theme === 'light' ? 'text-purple-500' : 'text-purple-400'
                }`}>Cache Information</h4>
                <p className={`text-sm transition-colors ${
                  theme === 'light' ? 'text-purple-500' : 'text-purple-400'
                }`}>
                  The application caches file icons and folder statistics to improve
                  performance. Cache is automatically managed and cleared when needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedCategory === 'about' && (
          <div className="w-full">
            <h2 className={`text-2xl font-bold mb-6 transition-colors ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>About Trove</h2>

            <div className="space-y-6">
              <div className={`p-6 rounded-lg border text-center transition-colors ${
                theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
              }`}>
                <img
                  src="/logo v1.svg"
                  alt="Trove Logo"
                  className="h-24 w-auto mx-auto mb-4"
                />
                <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>Trove</h3>
                <p className={`mb-4 transition-colors ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}>A modern file storage manager</p>
                <p className={`text-sm transition-colors ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>Version 1.0.0</p>
              </div>

              <div className={`p-4 rounded-lg border transition-colors ${
                theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
              }`}>
                <h3 className={`font-medium mb-3 transition-colors ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>Features</h3>
                <ul className={`text-sm space-y-2 transition-colors ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  <li>✓ Fast file browsing with grid and list views</li>
                  <li>✓ Real-time folder and disk statistics</li>
                  <li>✓ System monitoring and process management</li>
                  <li>✓ File preview and icon caching</li>
                  <li>✓ Quick access to frequently used folders</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg border transition-colors ${
                theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-700 border-gray-600'
              }`}>
                <h3 className={`font-medium mb-2 transition-colors ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>Built with</h3>
                <p className={`text-sm transition-colors ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  React • TypeScript • Tailwind CSS • Tauri • Rust
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
