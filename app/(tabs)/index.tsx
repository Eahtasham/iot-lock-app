import { Text, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-blue-600">Hello Expo + NativeWind 🚀</Text>
      <HelloWave />
    </View>
  );
}
