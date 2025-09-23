'use client';

import { motion } from 'framer-motion';
import { Home, Camera, Trophy, User, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'scan', label: 'Scan', icon: <Camera className="w-5 h-5" /> },
  { id: 'leaderboard', label: 'Rank', icon: <Trophy className="w-5 h-5" />, badge: 5 },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
];

interface BottomNavigationProps {
  onScanClick?: () => void;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function BottomNavigation({
  onScanClick,
  currentTab = 'home',
  onTabChange
}: BottomNavigationProps) {
  const [activeTab, setActiveTab] = useState(currentTab);

  const handleTabClick = (tab: string) => {
    if (tab === 'scan' && onScanClick) {
      onScanClick();
    } else {
      setActiveTab(tab);
      onTabChange?.(tab);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Glassmorphic Background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-green-900/80 backdrop-blur-xl border-t border-white/20" />

      {/* Navigation Items */}
      <div className="relative flex items-center justify-around py-2 px-4">
        {navItems.map((item, index) => {
          const isActive = activeTab === item.id;
          const isScan = item.id === 'scan';

          return (
            <motion.button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 ${
                isScan ? '-mt-4' : ''
              }`}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {isScan ? (
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0.7)",
                      "0 0 0 20px rgba(34, 197, 94, 0)",
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-lg opacity-70" />
                  <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full p-4 shadow-2xl">
                    {item.icon}
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className={`relative ${
                    isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.icon}
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </div>
                  <motion.span
                    className={`text-xs mt-1 ${
                      isActive
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {item.label}
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 dark:bg-green-400 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-bottom bg-white/80 dark:bg-green-900/80" />
    </div>
  );
}