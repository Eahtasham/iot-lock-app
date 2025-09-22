// //app/_layout.ts

// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { Ionicons } from '@expo/vector-icons';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Tabs } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { PaperProvider } from 'react-native-paper';
// import 'react-native-reanimated';
// import './globals.css';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <PaperProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         <Tabs
//           screenOptions={{
//             tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tabIconSelected,
//             tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
//             tabBarStyle: {
//               backgroundColor: Colors[colorScheme ?? 'light'].background,
//               borderTopColor: colorScheme === 'dark' ? '#333' : '#ddd',
//             },
//             headerShown: false,
//           }}
//         >
//           <Tabs.Screen 
//             name="home" 
//             options={{ 
//               title: 'Home',
//               tabBarIcon: ({ color, size }) => (
//                 <Ionicons name="home-outline" size={size} color={color} />
//               ),
//             }} 
//           />
//           <Tabs.Screen 
//             name="memorize" 
//             options={{ 
//               title: 'Memorize',
//               tabBarIcon: ({ color, size }) => (
//                 <Ionicons name="camera-outline" size={size} color={color} />
//               ),
//             }} 
//           />
//           <Tabs.Screen 
//             name="profile" 
//             options={{ 
//               title: 'Profile',
//               tabBarIcon: ({ color, size }) => (
//                 <Ionicons name="person-outline" size={size} color={color} />
//               ),
//             }} 
//           />
//         </Tabs>
//         <StatusBar style="auto" />
//       </ThemeProvider>
//     </PaperProvider>
//   );
// }