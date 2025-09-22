import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useUser } from '../hooks/useUser'; // Adjust path as needed

export default function IndexScreen() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to main app
        router.replace('/(tabs)/home');
      } else {
        // User is not authenticated, redirect to login
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking auth state
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg text-gray-600">Loading...</Text>
    </View>
  );
}