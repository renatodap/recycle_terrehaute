'use client';

import { useState } from 'react';
import { Calendar, MapPin, AlertCircle, Trash2, Recycle, Bell } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type ScheduleZone = {
  zone: string;
  areas: string[];
  recyclingDay: string;
  trashDays: string[];
  nextPickup: Date;
  notes?: string;
};

const schedules: ScheduleZone[] = [
  {
    zone: 'Zone A - North',
    areas: ['Downtown', 'Indiana State University', 'Deming Park area'],
    recyclingDay: 'Monday',
    trashDays: ['Monday', 'Thursday'],
    nextPickup: new Date('2024-01-29'),
    notes: 'Place bins at curb by 7 AM'
  },
  {
    zone: 'Zone B - South',
    areas: ['South 7th St', 'Hulman St', 'Wabash Ave South'],
    recyclingDay: 'Tuesday',
    trashDays: ['Tuesday', 'Friday'],
    nextPickup: new Date('2024-01-30')
  },
  {
    zone: 'Zone C - East',
    areas: ['East Side', 'Meadows', 'East Glen'],
    recyclingDay: 'Wednesday',
    trashDays: ['Wednesday', 'Saturday'],
    nextPickup: new Date('2024-01-31')
  },
  {
    zone: 'Zone D - West',
    areas: ['West Terre Haute', 'Sugar Creek', 'West College'],
    recyclingDay: 'Thursday',
    trashDays: ['Monday', 'Thursday'],
    nextPickup: new Date('2024-02-01')
  }
];

const holidays = [
  { date: 'January 1', name: 'New Year\'s Day', status: 'No pickup - rescheduled to next day' },
  { date: 'May 27', name: 'Memorial Day', status: 'No pickup - rescheduled to next day' },
  { date: 'July 4', name: 'Independence Day', status: 'No pickup - rescheduled to next day' },
  { date: 'September 2', name: 'Labor Day', status: 'No pickup - rescheduled to next day' },
  { date: 'November 28', name: 'Thanksgiving', status: 'No pickup - rescheduled to Friday' },
  { date: 'December 25', name: 'Christmas', status: 'No pickup - rescheduled to next day' }
];

export default function SchedulePage() {
  const [selectedZone, setSelectedZone] = useState<ScheduleZone | null>(null);
  const [address, setAddress] = useState('');
  const [showHolidays, setShowHolidays] = useState(false);

  const findZone = () => {
    // Simplified zone detection - in production, this would use actual address lookup
    const lowerAddress = address.toLowerCase();
    let zone = schedules[0]; // Default to Zone A

    if (lowerAddress.includes('south') || lowerAddress.includes('7th')) {
      zone = schedules[1];
    } else if (lowerAddress.includes('east') || lowerAddress.includes('meadow')) {
      zone = schedules[2];
    } else if (lowerAddress.includes('west')) {
      zone = schedules[3];
    }

    setSelectedZone(zone);
  };

  const formatNextPickup = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(date.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">Collection Schedule</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Address Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="font-semibold mb-4">Find Your Schedule</h2>
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={findZone}
                disabled={!address}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Find My Schedule
              </button>
            </div>
          </div>

          {/* Selected Zone Schedule */}
          {selectedZone && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-green-600 text-white p-4">
                <h3 className="font-semibold text-lg">{selectedZone.zone}</h3>
                <p className="text-green-100 text-sm">
                  {selectedZone.areas.join(', ')}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Next Pickup */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-green-900 dark:text-green-300">
                      Next Recycling Pickup
                    </span>
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatNextPickup(selectedZone.nextPickup)}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Every {selectedZone.recyclingDay}
                  </p>
                </div>

                {/* Regular Schedule */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Recycle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Recycling</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Every {selectedZone.recyclingDay}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Trash</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedZone.trashDays.join(' & ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedZone.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        {selectedZone.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Set Reminder Button */}
                <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Set Reminder</span>
                </button>
              </div>
            </div>
          )}

          {/* Holiday Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => setShowHolidays(!showHolidays)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-semibold">Holiday Schedule</h3>
              <span className="text-gray-400">
                {showHolidays ? '−' : '+'}
              </span>
            </button>

            {showHolidays && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {holidays.map((holiday, index) => (
                  <div
                    key={index}
                    className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{holiday.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {holiday.date}
                        </p>
                      </div>
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full">
                        No pickup
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {holiday.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Collection Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Place bins at curb by 7 AM on collection day</li>
              <li>• Keep bins 3 feet apart for easy pickup</li>
              <li>• Don&apos;t overfill - lid should close completely</li>
              <li>• Remove bins from curb within 24 hours</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}