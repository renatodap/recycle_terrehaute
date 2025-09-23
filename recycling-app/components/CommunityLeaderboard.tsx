'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Crown, Award, Users } from 'lucide-react';
import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  username: string;
  avatar?: string;
  score: number;
  itemsRecycled: number;
  streak: number;
  isCurrentUser?: boolean;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, previousRank: 1, username: 'EcoWarrior23', score: 2450, itemsRecycled: 892, streak: 65 },
  { rank: 2, previousRank: 3, username: 'GreenThumb', score: 2380, itemsRecycled: 856, streak: 42 },
  { rank: 3, previousRank: 2, username: 'NatureLover', score: 2150, itemsRecycled: 743, streak: 38 },
  { rank: 4, previousRank: 5, username: 'RecycleKing', score: 1980, itemsRecycled: 682, streak: 29 },
  { rank: 5, previousRank: 8, username: 'You', score: 1850, itemsRecycled: 384, streak: 42, isCurrentUser: true },
  { rank: 6, previousRank: 4, username: 'PlasticFree', score: 1720, itemsRecycled: 592, streak: 21 },
  { rank: 7, previousRank: 7, username: 'ZeroWaste', score: 1650, itemsRecycled: 567, streak: 18 },
  { rank: 8, previousRank: 6, username: 'EarthGuard', score: 1580, itemsRecycled: 512, streak: 15 },
  { rank: 9, previousRank: 10, username: 'CleanCity', score: 1420, itemsRecycled: 468, streak: 12 },
  { rank: 10, previousRank: 9, username: 'GreenHero', score: 1350, itemsRecycled: 423, streak: 10 }
];

export default function CommunityLeaderboard() {
  const [timeframe, setTimeframe] = useState('week');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) {
      return { icon: <TrendingUp className="w-3 h-3 text-green-500" />, text: `+${diff}`, color: 'text-green-500' };
    } else if (diff < 0) {
      return { icon: <TrendingDown className="w-3 h-3 text-red-500" />, text: `${diff}`, color: 'text-red-500' };
    }
    return { icon: <Minus className="w-3 h-3 text-gray-400" />, text: '—', color: 'text-gray-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-green-50">
            Community Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-green-200">
          <Users className="w-4 h-4" />
          <span>1,284 participants</span>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <Tabs.Root value={timeframe} onValueChange={setTimeframe}>
        <Tabs.List className="flex gap-2 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl">
          <Tabs.Trigger
            value="day"
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm"
          >
            Today
          </Tabs.Trigger>
          <Tabs.Trigger
            value="week"
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm"
          >
            This Week
          </Tabs.Trigger>
          <Tabs.Trigger
            value="month"
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm"
          >
            This Month
          </Tabs.Trigger>
          <Tabs.Trigger
            value="all"
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm"
          >
            All Time
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[2, 1, 3].map((position) => {
          const entry = mockLeaderboard.find(e => e.rank === position);
          if (!entry) return null;

          return (
            <motion.div
              key={position}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (position === 1 ? 0.2 : position === 2 ? 0.1 : 0.3) }}
              className={`relative ${position === 1 ? 'order-2 -mt-4' : position === 2 ? 'order-1' : 'order-3'}`}
            >
              <div className={`
                relative bg-white/80 dark:bg-green-900/80 backdrop-blur-md border border-white/30
                rounded-2xl p-4 shadow-xl text-center
                ${position === 1 ? 'border-yellow-400/50' : ''}
              `}>
                {position === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-2xl blur-xl" />
                )}

                <div className="relative">
                  <div className={`
                    mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2
                    ${position === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                      position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      'bg-gradient-to-br from-orange-400 to-orange-500'}
                    text-white shadow-lg
                  `}>
                    <span className="text-2xl font-bold">{position}</span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-green-50 mb-1">
                    {entry.username}
                  </h3>

                  <p className="text-xl font-mono font-bold text-gray-900 dark:text-green-50">
                    {entry.score.toLocaleString()}
                  </p>

                  <div className="mt-2 flex items-center justify-center gap-1">
                    {getRankIcon(position)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-emerald-400/5 rounded-3xl blur-xl" />
        <div className="relative bg-white/60 dark:bg-green-900/60 backdrop-blur-md border border-white/30 rounded-3xl shadow-xl overflow-hidden">
          <div className="divide-y divide-gray-200/50 dark:divide-green-700/50">
            <AnimatePresence>
              {mockLeaderboard.map((entry, index) => {
                const rankChange = getRankChange(entry.rank, entry.previousRank);

                return (
                  <motion.div
                    key={entry.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-green-800/50 transition-colors
                      ${entry.isCurrentUser ? 'bg-gradient-to-r from-green-400/10 to-emerald-400/10' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${entry.rank <= 3
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                        `}>
                          {entry.rank}
                        </div>
                        <div className="flex items-center gap-1">
                          {rankChange.icon}
                          <span className={`text-xs ${rankChange.color}`}>{rankChange.text}</span>
                        </div>
                      </div>

                      <div>
                        <p className={`font-heading font-semibold ${
                          entry.isCurrentUser ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-green-50'
                        }`}>
                          {entry.username}
                          {entry.isCurrentUser && ' (You)'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-green-300">
                          <span>♻️ {entry.itemsRecycled}</span>
                          <span>🔥 {entry.streak}d</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-bold text-lg text-gray-900 dark:text-green-50">
                        {entry.score.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-green-400">points</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Your Position Card (if not in top 10) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl" />
        <div className="relative bg-white/80 dark:bg-green-900/80 backdrop-blur-md border-2 border-green-400/50 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-green-300">Your Current Position</p>
              <p className="text-2xl font-heading font-bold text-green-700 dark:text-green-400">
                Rank #5
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-green-300">Points to next rank</p>
              <p className="text-xl font-mono font-bold text-gray-900 dark:text-green-50">130</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}