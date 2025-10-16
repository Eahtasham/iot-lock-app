// services/notificationService.ts
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export interface NotificationData {
    visit_id?: string;
    visitor_name?: string;
    image_url?: string;
    detected_label?: string;
    timestamp?: string;
    action?: string;
    screen?: string;
}

class NotificationService {
    private notificationListener: any = null;
    private responseListener: any = null;

    // Register for push notifications and get Expo push token
    async registerForPushNotificationsAsync(): Promise<string | null> {
        try {
            // Check if it's a physical device
            if (!Device.isDevice) {
                console.log('Must use physical device for Push Notifications');
                return null;
            }

            // Get existing permission status
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permission if not already granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return null;
            }

            // Configure Android notification channel first
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    sound: 'default',
                });
            }

            let token = null;

            try {
                // Try to get Expo push token
                // For Expo Go, you don't need projectId
                // For production/development builds, you need projectId
                const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

                if (Constants.appOwnership === 'expo') {
                    // Running in Expo Go - don't need projectId
                    const tokenData = await Notifications.getExpoPushTokenAsync();
                    token = tokenData.data;
                } else if (projectId) {
                    // Running in standalone/dev build - need projectId
                    const tokenData = await Notifications.getExpoPushTokenAsync({
                        projectId,
                    });
                    token = tokenData.data;
                } else {
                    // Try without projectId as fallback
                    console.log('No project ID found, trying without it...');
                    const tokenData = await Notifications.getExpoPushTokenAsync();
                    token = tokenData.data;
                }

                console.log('Expo Push Token:', token);
                return token;
            } catch (tokenError: any) {
                console.error('Token error details:', tokenError);

                // If it's a Firebase error, provide instructions
                if (tokenError.message?.includes('Firebase')) {
                    console.log('=================================');
                    console.log('Firebase Configuration Required!');
                    console.log('=================================');
                    console.log('For Android devices, you need to:');
                    console.log('1. Create a Firebase project');
                    console.log('2. Add your Android app (package: com.eahtasham.iotlockapp)');
                    console.log('3. Download google-services.json');
                    console.log('4. Place it in your project root');
                    console.log('5. Rebuild your app');
                    console.log('');
                    console.log('OR use Expo Go for development testing');
                    console.log('=================================');
                }

                return null;
            }
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    }

    // Set up notification listeners
    setupNotificationListeners(
        onNotificationReceived?: (notification: Notifications.Notification) => void,
        onNotificationResponse?: (response: Notifications.NotificationResponse) => void
    ) {
        // Listener for notifications received while app is in foreground
        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            }
        });

        // Listener for when user interacts with notification
        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
            const data = response.notification.request.content.data as NotificationData;

            if (onNotificationResponse) {
                onNotificationResponse(response);
            }

            // Handle navigation based on the screen parameter
            if (data?.screen) {
                this.handleNotificationNavigation(data);
            }
        });
    }

    // Handle navigation based on notification data
    private handleNotificationNavigation(data: NotificationData) {
        // This will be implemented based on your navigation setup
        // For now, just log the screen to navigate to
        console.log('Navigate to screen:', data.screen);
        console.log('Notification data:', data);

        // Example navigation logic (you'll need to adapt this to your navigation setup):
        // if (data.screen === 'VisitDetails' && data.visit_id) {
        //   navigation.navigate('VisitDetails', { visitId: data.visit_id });
        // } else if (data.screen === 'VisitorAlert') {
        //   navigation.navigate('VisitorAlert', { visitorData: data });
        // }
    }

    // Clean up listeners
    // removeNotificationListeners() {
    //     if (this.notificationListener) {
    //         Notifications.removeNotificationSubscription(this.notificationListener);
    //     }
    //     if (this.responseListener) {
    //         Notifications.removeNotificationSubscription(this.responseListener);
    //     }
    // }

    // Schedule a local notification (for testing)
    async scheduleLocalNotification(title: string, body: string, data?: any, seconds: number = 5) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data || {},
                sound: 'default',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: seconds,
            },
        });
    }

    // Get the last notification response (useful for handling notifications that opened the app)
    async getLastNotificationResponse() {
        const response = await Notifications.getLastNotificationResponseAsync();
        return response;
    }
}

export default new NotificationService();