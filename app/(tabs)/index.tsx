import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TabsIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home tab by default
    router.replace('/(tabs)/home');
  }, []);

  return null;
}