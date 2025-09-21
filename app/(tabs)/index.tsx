import { HelloWave } from '@/components/hello-wave';
import { Camera, Heart } from "lucide-react-native";
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      {/* <Text className="text-3xl font-bold text-blue-600">Hello Expo + NativeWind 🚀</Text> */}
      <Camera color="black" size={32} />
      <Heart color="red" size={32} />
      <HelloWave />
      <Text variant="headlineMedium">Hello</Text>
      <Button className='bg-secondary' mode="contained" onPress={() => console.log('Pressed')}>
        Press me
      </Button>
    </View>
  );
}
