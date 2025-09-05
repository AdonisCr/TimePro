import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    weekly: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'data', label: 'Data & Privacy', icon: Download }
  ];

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-text-soft" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark">Sarah Johnson</h3>
                <p className="text-text-soft">Project Manager</p>
                <button className="mt-2 text-primary hover:text-primary-hover font-medium">
                  Change Photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue="Sarah"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue="Johnson"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="sarah.johnson@company.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Bio</label>
              <textarea
                rows={4}
                defaultValue="Experienced project manager with a passion for delivering high-quality results and leading cross-functional teams."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries({
                  email: 'Email Notifications',
                  push: 'Push Notifications',
                  desktop: 'Desktop Notifications',
                  weekly: 'Weekly Summary'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-text-dark">{label}</h4>
                      <p className="text-sm text-text-soft">
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'push' && 'Get push notifications on your device'}
                        {key === 'desktop' && 'Show desktop notifications'}
                        {key === 'weekly' && 'Weekly summary of your activity'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-soft hover:text-text-dark"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Two-Factor Authentication</h3>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-dark">Enable 2FA</h4>
                    <p className="text-sm text-text-soft">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Light', 'Dark', 'Auto'].map((theme) => (
                  <div key={theme} className="p-4 border-2 border-primary rounded-xl cursor-pointer hover:bg-primary/5 transition-colors">
                    <div className="text-center">
                      <div className={`w-16 h-12 mx-auto mb-3 rounded-lg ${
                        theme === 'Light' ? 'bg-white border-2 border-gray-200' :
                        theme === 'Dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'
                      }`}></div>
                      <span className="font-medium text-text-dark">{theme}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Color Scheme</h3>
              <div className="flex space-x-4">
                {['#00B4DB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'].map((color) => (
                  <button
                    key={color}
                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Language & Region</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Language</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>French</option>
                    <option>Spanish</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Time Zone</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+1 (Central European Time)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Data Export</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-text-dark mb-2">Export Your Data</h4>
                  <p className="text-sm text-text-soft mb-4">Download a copy of all your data including tasks, projects, and time tracking.</p>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Danger Zone</h3>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Settings</h1>
          <p className="text-text-soft mt-1">Manage your account preferences and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-soft hover:bg-gray-50 hover:text-text-dark'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
              <button className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;