'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, TreePine, Users, Target, Award, Star, Shield } from 'lucide-react';
import { useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  color: string;
  bgGradient: string;
}

const badges: Badge[] = [
  {
    id: 'first-recycle',
    name: 'First Step',
    description: 'Recycled your first item',
    icon: <Star className="w-6 h-6" />,
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-400 to-amber-500'
  },
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: '7-day recycling streak',
    icon: <Zap className="w-6 h-6" />,
    unlocked: true,
    progress: 7,
    maxProgress: 7,
    color: 'text-blue-600',
    bgGradient: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'eco-champion',
    name: 'Eco Champion',
    description: 'Saved 100kg of CO2',
    icon: <TreePine className="w-6 h-6" />,
    unlocked: true,
    progress: 127,
    maxProgress: 100,
    color: 'text-green-600',
    bgGradient: 'from-green-400 to-emerald-500'
  },
  {
    id: 'community-leader',
    name: 'Community Leader',
    description: 'Top 10 in leaderboard',
    icon: <Trophy className="w-6 h-6" />,
    unlocked: false,
    progress: 15,
    maxProgress: 10,
    color: 'text-purple-600',
    bgGradient: 'from-purple-400 to-pink-500'
  },
  {
    id: 'master-sorter',
    name: 'Master Sorter',
    description: 'Correctly sorted 500 items',
    icon: <Target className="w-6 h-6" />,
    unlocked: false,
    progress: 384,
    maxProgress: 500,
    color: 'text-orange-600',
    bgGradient: 'from-orange-400 to-red-500'
  },
  {
    id: 'green-guardian',
    name: 'Green Guardian',
    description: '30-day streak achieved',
    icon: <Shield className="w-6 h-6" />,
    unlocked: false,
    progress: 42,
    maxProgress: 30,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-400 to-teal-500'
  }
];

export default function AchievementBadges() {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-green-50">
          🏆 Achievements
        </h2>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          <span className="font-mono font-bold text-gray-900 dark:text-green-50">
            {badges.filter(b => b.unlocked).length}/{badges.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => (
          <motion.button
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
            whileTap={{ scale: badge.unlocked ? 0.95 : 1 }}
            onClick={() => badge.unlocked && setSelectedBadge(badge)}
            className={`relative group ${!badge.unlocked && 'cursor-not-allowed'}`}
          >
            <div className={`
              relative p-4 rounded-2xl border-2 transition-all
              ${badge.unlocked
                ? 'bg-white/80 dark:bg-green-900/80 backdrop-blur-md border-white/30 shadow-lg'
                : 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-300/30 opacity-60'}
            `}>
              {badge.unlocked && (
                <div className={`absolute inset-0 bg-gradient-to-br ${badge.bgGradient} rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity`} />
              )}

              <div className="relative">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  badge.unlocked
                    ? `bg-gradient-to-br ${badge.bgGradient} text-white shadow-lg`
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                }`}>
                  {badge.icon}
                </div>

                <h3 className={`font-heading font-bold text-sm ${
                  badge.unlocked ? 'text-gray-900 dark:text-green-50' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {badge.name}
                </h3>

                {!badge.unlocked && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-gray-400 to-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {badge.progress}/{badge.maxProgress}
                    </p>
                  </div>
                )}

                {badge.unlocked && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.5 + index * 0.1 }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-xs">✓</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            className="bg-white dark:bg-green-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 bg-gradient-to-br ${selectedBadge.bgGradient} text-white shadow-xl`}>
              {selectedBadge.icon}
            </div>
            <h3 className="text-2xl font-heading font-bold text-center text-gray-900 dark:text-green-50 mb-2">
              {selectedBadge.name}
            </h3>
            <p className="text-center text-gray-600 dark:text-green-200 mb-4">
              {selectedBadge.description}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-green-100">
                Unlocked: {new Date().toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}