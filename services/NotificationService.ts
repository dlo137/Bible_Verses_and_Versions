import { Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Conditionally import expo-notifications only if not in Expo Go
let Notifications: any = null;
let isNotificationsAvailable = false;

try {
  // Only import if not in Expo Go
  if (Constants.appOwnership !== 'expo') {
    Notifications = require('expo-notifications');
    isNotificationsAvailable = true;
  }
} catch (error) {
  console.log('expo-notifications not available, using mock mode');
  isNotificationsAvailable = false;
}

// Safe notification function wrapper
const safeNotificationCall = async (fn: () => Promise<any>, fallback: any = null) => {
  if (!isNotificationsAvailable) {
    console.log('Notifications not available, returning fallback');
    return fallback;
  }
  try {
    return await fn();
  } catch (error) {
    console.error('Notification call failed:', error);
    return fallback;
  }
};

class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification handler
  public initialize() {
    if (!isNotificationsAvailable) {
      console.log('Notifications not available, skipping initialization');
      return;
    }

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      console.log('✅ Notification handler initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification handler:', error);
    }
  }

  // Check if notifications are available
  public isAvailable(): boolean {
    return isNotificationsAvailable;
  }

  // Add notification received listener
  public addNotificationReceivedListener(callback: (notification: any) => void) {
    if (!isNotificationsAvailable) {
      console.log('Notifications not available, skipping listener setup');
      return { remove: () => {} };
    }

    try {
      return Notifications.addNotificationReceivedListener(callback);
    } catch (error) {
      console.error('Failed to add notification listener:', error);
      return { remove: () => {} };
    }
  }

  // Request notification permissions
  public async registerForPushNotifications(): Promise<string | null> {
    console.log('📱 Checking if device supports notifications...');
    console.log('Is physical device:', Device.isDevice);
    console.log('Notifications available:', isNotificationsAvailable);

    if (!Device.isDevice) {
      Alert.alert('Notifications', 'Push notifications only work on physical devices');
      return null;
    }

    if (!isNotificationsAvailable) {
      console.log('📱 Notifications not available in Expo Go, returning mock permission');
      Alert.alert(
        'Demo Mode',
        'Notifications have limited support in Expo Go. In production builds, this would request real notification permissions.',
        [{ text: 'OK' }]
      );
      return 'granted'; // Mock permission for Expo Go
    }

    try {
      const { status: existingStatus } = await safeNotificationCall(
        () => Notifications.getPermissionsAsync(),
        { status: 'undetermined' }
      );
      
      console.log('📋 Existing permission status:', existingStatus);
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('🔔 Requesting notification permissions...');
        const { status } = await safeNotificationCall(
          () => Notifications.requestPermissionsAsync(),
          { status: 'denied' }
        );
        finalStatus = status;
        console.log('✅ Permission request result:', status);
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied');
        Alert.alert('Permission Required', 'Please enable notifications to receive daily reminders');
        return null;
      }

      console.log('✅ Notification permissions granted!');
      return finalStatus;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return null;
    }
  }

  // Schedule a notification
  public async scheduleNotification(content: any, trigger: any): Promise<string | null> {
    if (!isNotificationsAvailable) {
      console.log('📱 Mock notification scheduled:', content.title);
      Alert.alert(
        'Demo Notification Scheduled',
        `Mock notification "${content.title}" scheduled for demo purposes. In production, this would be a real notification.`,
        [{ text: 'OK' }]
      );
      return 'mock-notification-id';
    }

    try {
      const notificationId = await safeNotificationCall(
        () => Notifications.scheduleNotificationAsync({ content, trigger }),
        null
      );
      console.log('✅ Notification scheduled! ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      throw error;
    }
  }

  // Cancel all scheduled notifications
  public async cancelAllScheduledNotifications(): Promise<void> {
    if (!isNotificationsAvailable) {
      console.log('📱 Mock: All notifications canceled');
      return;
    }

    try {
      await safeNotificationCall(() => Notifications.cancelAllScheduledNotificationsAsync());
      console.log('🗑️ All notifications canceled');
    } catch (error) {
      console.error('❌ Error canceling notifications:', error);
      throw error;
    }
  }

  // Get all scheduled notifications
  public async getAllScheduledNotifications(): Promise<any[]> {
    if (!isNotificationsAvailable) {
      console.log('📱 Mock: Returning empty notifications list');
      return [];
    }

    try {
      const notifications = await safeNotificationCall(
        () => Notifications.getAllScheduledNotificationsAsync(),
        []
      );
      console.log('📋 Scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Send test notification
  public async sendTestNotification(): Promise<void> {
    const permission = await this.registerForPushNotifications();
    if (!permission) {
      console.log('❌ Permission denied, cannot send test notification');
      return;
    }

    if (!isNotificationsAvailable) {
      Alert.alert(
        'Demo Test Notification',
        'In Expo Go, this is a demo. In production, a real notification would be scheduled in 5 seconds.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('🧪 Scheduling test notification in 5 seconds...');

    const notificationId = await this.scheduleNotification(
      {
        title: 'Test Notification',
        body: 'If you see this, notifications are working!',
        sound: true,
      },
      {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5
      }
    );

    console.log('✅ Test notification scheduled! ID:', notificationId);
    Alert.alert(
      'Test Scheduled',
      'Notification will appear in 5 seconds.\n\nIMPORTANT: Put the app in the background or close it to see the notification!',
      [{ text: 'OK' }]
    );
  }

  // Schedule daily notification
  public async scheduleDailyNotification(time: Date): Promise<void> {
    try {
      console.log('⏰ Starting notification scheduling process...');
      console.log('Selected time:', time.toLocaleTimeString());

      // Request permissions first
      const permission = await this.registerForPushNotifications();
      if (!permission) {
        console.log('❌ No permission, aborting schedule');
        return;
      }

      // Cancel all existing notifications
      console.log('🗑️ Canceling existing notifications...');
      await this.cancelAllScheduledNotifications();

      // Schedule the notification
      const trigger = isNotificationsAvailable ? {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true,
      } : null;

      console.log('📅 Scheduling notification with trigger:', trigger);

      const notificationId = await this.scheduleNotification(
        {
          title: 'Time for Your Daily Verse',
          body: 'Open the app for today\'s inspiring Scripture and prayer',
          sound: true,
        },
        trigger
      );

      console.log('✅ Notification scheduled successfully! ID:', notificationId);

      // Get all scheduled notifications to verify (only in production)
      if (isNotificationsAvailable) {
        const scheduledNotifications = await this.getAllScheduledNotifications();
        console.log('📋 Total scheduled notifications:', scheduledNotifications.length);
      }
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification. Please try again.');
    }
  }
}

export default NotificationService.getInstance();