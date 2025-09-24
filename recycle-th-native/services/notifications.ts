import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_TOKEN_KEY = '@notification_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
      });
    }

    return token;
  }

  static async scheduleCollectionReminder(zone: string, dayOfWeek: number) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '♻️ Recycling Collection Tomorrow',
        body: `Don't forget to put out your recycling bins tonight!`,
        data: { type: 'collection_reminder', zone },
        categoryIdentifier: 'collection',
      },
      trigger: {
        type: 'weekly' as const,
        weekday: dayOfWeek,
        hour: 19,
        minute: 0,
        repeats: true,
      } as any,
    });
  }

  static async scheduleSpecialEvent(event: {
    title: string;
    date: Date;
    description: string;
  }) {
    const trigger = new Date(event.date);
    trigger.setDate(trigger.getDate() - 1); // Day before
    trigger.setHours(10, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Special Recycling Event Tomorrow',
        body: `${event.title}: ${event.description}`,
        data: { type: 'special_event', event },
        categoryIdentifier: 'event',
      },
      trigger: { date: trigger } as any,
    });
  }

  static async sendAchievementNotification(achievement: {
    title: string;
    description: string;
    badge?: string;
  }) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 Achievement Unlocked!`,
        body: `${achievement.title}: ${achievement.description}`,
        data: { type: 'achievement', achievement },
        categoryIdentifier: 'achievement',
        badge: achievement.badge ? parseInt(achievement.badge, 10) : undefined,
      },
      trigger: null, // Send immediately
    });
  }

  static async sendGeofenceNotification(location: {
    name: string;
    accepts: string[];
  }) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📍 Recycling Center Nearby',
        body: `You're near ${location.name}. They accept: ${location.accepts.slice(0, 3).join(', ')}`,
        data: { type: 'geofence', location },
        categoryIdentifier: 'location',
      },
      trigger: null,
    });
  }

  static async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  static setupNotificationListeners() {
    // Handle notifications when app is in foreground
    const subscription1 = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification taps
    const subscription2 = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;

      switch (data.type) {
        case 'collection_reminder':
          // Navigate to schedule screen
          break;
        case 'special_event':
          // Navigate to events screen
          break;
        case 'achievement':
          // Navigate to achievements screen
          break;
        case 'geofence':
          // Navigate to location details
          break;
      }
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }

  static async configureCategories(): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('collection', [
        {
          identifier: 'mark_done',
          buttonTitle: 'Done',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'snooze',
          buttonTitle: 'Remind in 1 hour',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('event', [
        {
          identifier: 'view_details',
          buttonTitle: 'View Details',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'add_to_calendar',
          buttonTitle: 'Add to Calendar',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    }
  }

  static async setBadgeCount(count: number) {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  static async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }
}