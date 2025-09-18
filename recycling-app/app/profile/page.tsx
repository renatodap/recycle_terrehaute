'use client';

import { Settings, MapPin, Bell, Info, MessageCircle, Share2, LogOut } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const menuItems = [
    {
      icon: MapPin,
      label: 'My Address',
      value: 'Set your address',
      color: 'text-blue-600',
    },
    {
      icon: Bell,
      label: 'Notifications',
      value: 'Pickup reminders',
      color: 'text-purple-600',
    },
    {
      icon: Settings,
      label: 'Settings',
      value: 'App preferences',
      color: 'text-gray-600',
    },
    {
      icon: Info,
      label: 'About',
      value: 'Version 1.0.0',
      color: 'text-green-600',
    },
    {
      icon: MessageCircle,
      label: 'Feedback',
      value: 'Help us improve',
      color: 'text-orange-600',
    },
    {
      icon: Share2,
      label: 'Share App',
      value: 'Tell your neighbors',
      color: 'text-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">♻️</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Recycling Hero</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Making Terre Haute greener, one item at a time
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">42</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Items Scanned</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">85%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Recycled Right</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Weeks Active</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.value}</p>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              );
            })}
          </div>

          {/* Sign Out Button */}
          <button className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-2">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}