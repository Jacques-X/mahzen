import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Database,
  HardDrive,
  Info,
  ChevronRight,
  Volume2,
} from 'lucide-react';

interface SettingCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SettingsViewProps {}

export const SettingsView = ({}: SettingsViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState('notifications');
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScan, setAutoScan] = useState(true);
  const [scanInterval, setScanInterval] = useState('30');

  const categories: SettingCategory[] = [
    { id: 'notifications', name: 'Notifications', icon: <Bell size={20} /> },
    { id: 'storage', name: 'Storage', icon: <HardDrive size={20} /> },
    { id: 'about', name: 'About', icon: <Info size={20} /> },
  ];

  return (
    <div className="flex h-full w-full rounded-3xl shadow-xl border transition-colors bg-[#F9FAFB] border-gray-200/60">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col transition-colors bg-white border-gray-200/60">
        <div className="p-6 border-b transition-colors border-gray-100">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-blue-600" />
            <h1 className="text-xl font-semibold transition-colors text-gray-900">Settings</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors 
                ${selectedCategory === category.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
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

        <div className="p-4 border-t text-xs transition-colors border-gray-100 text-gray-500">
          <p>Version 1.0.0</p>
          <p>© 2025 Trove</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        {selectedCategory === 'notifications' && (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 transition-colors text-gray-900">Notifications</h2>

            <div className="space-y-6">
              {/* Enable notifications */}
              <div className="flex items-center justify-between p-4 rounded-lg border transition-colors bg-white border-gray-100">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-600" />
                  <div>
                    <h3 className="font-medium transition-colors text-gray-900">
                      Enable Notifications
                    </h3>
                    <p className="text-sm transition-colors text-gray-500">
                      Receive alerts for important events
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-blue-600' : 'bg-gray-200'
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
              <div className="flex items-center justify-between p-4 rounded-lg border transition-colors bg-white border-gray-100">
                <div className="flex items-center gap-3">
                  <Volume2 size={20} className="text-gray-600" />
                  <div>
                    <h3 className="font-medium transition-colors text-gray-900">Notification Sound</h3>
                    <p className="text-sm transition-colors text-gray-500">
                      Play sound for notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  disabled={!notifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled && notifications ? 'bg-blue-600' : 'bg-gray-200'
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
            <h2 className="text-2xl font-bold mb-6 transition-colors text-gray-900">Storage</h2>

            <div className="space-y-6">
              {/* Auto scan */}
              <div className="flex items-center justify-between p-4 rounded-lg border transition-colors bg-white border-gray-100">
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-gray-600" />
                  <div>
                    <h3 className="font-medium transition-colors text-gray-900">
                      Automatic Scanning
                    </h3>
                    <p className="text-sm transition-colors text-gray-500">
                      Automatically scan folders for changes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoScan(!autoScan)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoScan ? 'bg-blue-600' : 'bg-gray-200'
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
                <div className="p-4 rounded-lg border transition-colors bg-white border-gray-100">
                  <label className="block mb-2">
                    <span className="text-sm font-medium transition-colors text-gray-900">
                      Scan Interval (seconds)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={scanInterval}
                    onChange={(e) => setScanInterval(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors border-gray-300 bg-white text-gray-900"
                  />
                  <p className="text-xs mt-2 transition-colors text-gray-500">
                    Interval between automatic folder scans
                  </p>
                </div>
              )}

              {/* Cache info */}
              <div className="p-4 rounded-lg border transition-colors bg-blue-50 border-blue-200">
                <h4 className="font-medium mb-2 transition-colors text-blue-900">Cache Information</h4>
                <p className="text-sm transition-colors text-blue-800">
                  The application caches file icons and folder statistics to improve
                  performance. Cache is automatically managed and cleared when needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedCategory === 'about' && (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 transition-colors text-gray-900">About Trove</h2>

            <div className="space-y-6">
              <div className="p-6 rounded-lg border text-center transition-colors bg-white border-gray-100">
                <img
                  src="/logo v1.svg"
                  alt="Trove Logo"
                  className="h-24 w-auto mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold mb-2 transition-colors text-gray-900">Trove</h3>
                <p className="mb-4 transition-colors text-gray-600">A modern file storage manager</p>
                <p className="text-sm transition-colors text-gray-500">Version 1.0.0</p>
              </div>

              <div className="p-4 rounded-lg border transition-colors bg-white border-gray-100">
                <h3 className="font-medium mb-3 transition-colors text-gray-900">Features</h3>
                <ul className="text-sm space-y-2 transition-colors text-gray-600">
                  <li>✓ Fast file browsing with grid and list views</li>
                  <li>✓ Real-time folder and disk statistics</li>
                  <li>✓ System monitoring and process management</li>
                  <li>✓ File preview and icon caching</li>
                  <li>✓ Quick access to frequently used folders</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border transition-colors bg-gray-50 border-gray-200">
                <h3 className="font-medium mb-2 transition-colors text-gray-900">Built with</h3>
                <p className="text-sm transition-colors text-gray-600">
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
