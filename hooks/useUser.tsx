import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NotificationService from '../services/notificationService';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  expoPushToken: string | null;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL - Replace with your backend URL
const API_BASE_URL = 'https://iot-lock-backend.onrender.com'; // Change this to your actual backend URL

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    loadStoredUser();
    initializeNotifications();
  }, []);

  // Register device token when user changes
  useEffect(() => {
    if (user && expoPushToken) {
      registerDeviceToken(user.id, expoPushToken);
    }
  }, [user, expoPushToken]);

  const initializeNotifications = async () => {
    try {
      // Register for push notifications and get token
      const token = await NotificationService.registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        console.log('Push token obtained:', token);
      }

      // Set up notification listeners
      NotificationService.setupNotificationListeners(
        // Handle foreground notifications
        (notification) => {
          console.log('Notification received in foreground:', notification);
          // You can show a custom in-app notification here if needed
        },
        // Handle notification interactions
        (response) => {
          console.log('User interacted with notification:', response);
          // Navigation will be handled by the NotificationService
        }
      );

      // Check if app was opened from a notification
      const lastResponse = await NotificationService.getLastNotificationResponse();
      if (lastResponse) {
        console.log('App opened from notification:', lastResponse);
        // Handle the notification that opened the app
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const registerDeviceToken = async (userId: string, token: string) => {
    try {
      const deviceInfo = {
        owner_id: parseInt(userId),
        expo_push_token: token,
        platform: Platform.OS,
        device_name: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
        app_version: '1.0.0', // You can get this from your app.json or package.json
      };

      const response = await fetch(`${API_BASE_URL}/api/device/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify(deviceInfo),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Device token registered successfully:', data);
      } else {
        console.error('Failed to register device token:', data.detail);
      }
    } catch (error) {
      console.error('Error registering device token:', error);
    }
  };

  const unregisterDeviceToken = async (userId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/devices/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({
          owner_id: parseInt(userId),
          expo_push_token: token,
        }),
      });

      if (response.ok) {
        console.log('Device token unregistered successfully');
      }
    } catch (error) {
      console.error('Error unregistering device token:', error);
    }
  };

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const storeUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error storing user:', error);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        // Registration successful
        return true;
      } else {
        // Registration failed
        console.error('Registration failed:', data.detail);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        const userData: User = {
          id: data.user_id,
          name: data.name,
          email: data.email,
          access_token: data.access_token,
        };
        
        await storeUser(userData);
        
        // Register device token after successful login
        if (expoPushToken) {
          await registerDeviceToken(userData.id, expoPushToken);
        }
        
        return true;
      } else {
        // Login failed
        console.error('Login failed:', data.detail);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Unregister device token before logout
      if (user && expoPushToken) {
        await unregisterDeviceToken(user.id, expoPushToken);
      }
      
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        setUser,
        expoPushToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
}