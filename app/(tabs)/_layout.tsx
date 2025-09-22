import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, Dimensions, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: state.index,
      useNativeDriver: false,
    }).start();
  }, [state.index]);

  // Calculate proper spacing
  const screenWidth = Dimensions.get('window').width;
  const tabBarWidth = screenWidth - 40; // 20px margin on each side
  const paddingHorizontal = 20;
  const availableWidth = tabBarWidth - (paddingHorizontal * 2);
  const tabWidth = availableWidth / 3; // 3 visible tabs
  
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      paddingHorizontal + (tabWidth * 0) + (tabWidth / 2) - 25, // Center of first tab minus half circle width
      paddingHorizontal + (tabWidth * 1) + (tabWidth / 2) - 25, // Center of second tab minus half circle width
      paddingHorizontal + (tabWidth * 2) + (tabWidth / 2) - 25, // Center of third tab minus half circle width
    ],
  });

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 20,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: '#1a1a1a',
        borderRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          width: 50,
          height: 50,
          backgroundColor: '#007AFF',
          borderRadius: 25,
          transform: [{ translateX }],
        }}
      />
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        const getIconName = (routeName: string) => {
          if (routeName === 'home') {
            return isFocused ? 'home' as const : 'home-outline' as const;
          } else if (routeName === 'memorize') {
            return isFocused ? 'camera' as const : 'camera-outline' as const;
          } else if (routeName === 'profile') {
            return isFocused ? 'person' as const : 'person-outline' as const;
          }
          // No icon for other routes (like index)
          return undefined;
        };
        
        const iconName = getIconName(route.name);
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Skip rendering if no icon
        if (!iconName) return null;

        return (
          <Pressable
            key={index}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? '#ffffff' : '#666666'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="memorize" />
      <Tabs.Screen name="profile" />
      {/* 👇 hide index so it doesn't appear as a tab */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}