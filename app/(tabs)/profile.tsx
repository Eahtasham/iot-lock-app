import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../hooks/useUser'; // Adjust path as needed

interface ProfileOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const API_BASE_URL = 'https://iot-lock-backend.onrender.com';

export default function ProfileScreen() {
  const { user, logout } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async () => {
    if (!user || !user.access_token) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!oldPassword.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'Password changed successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                setOldPassword('');
                setNewPassword('');
              }
            }
          ]
        );
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Please check your internet connection and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    setModalVisible(true);
  };

  const handleAboutUs = () => {
    Alert.alert(
      'About Us',
      'Smart Door Security System\nVersion 1.0.0\n\nSecure your home with advanced IoT technology.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await logout();
              // Navigate to login screen
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const profileOptions: ProfileOption[] = [
    {
      id: '1',
      title: 'Change Password',
      icon: 'lock-closed-outline',
      onPress: handleChangePassword,
    },
    {
      id: '3',
      title: 'Version',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('Version Information', 'Smart Door Security System\nVersion 1.0.0'),
    },
    {
      id: '4',
      title: 'About Us',
      icon: 'people-outline',
      onPress: handleAboutUs,
    },
    {
      id: '5',
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: handleLogout,
    },
  ];

  const renderProfileOption = (option: ProfileOption) => {
    const isLogout = option.id === '5';

    return (
      <TouchableOpacity
        key={option.id}
        className={`flex-row items-center justify-between px-6 py-5 border-b border-gray-50 active:bg-gray-50 ${isLogout ? 'border-b-0' : ''
          }`}
        onPress={option.onPress}
        disabled={isLoading && isLogout}
        style={{ opacity: (isLoading && isLogout) ? 0.6 : 1 }}
      >
        <View className="flex-row items-center flex-1">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isLogout ? 'bg-red-50' : 'bg-blue-50'
            }`}>
            <Ionicons
              name={option.icon as any}
              size={20}
              style={{ color: isLogout ? '#EF4444' : 'var(--primary)' }}
            />
          </View>
          <Text
            className="text-base font-medium"
            style={{ color: isLogout ? '#EF4444' : 'var(--secondary)' }}
          >
            {option.title}
          </Text>
          {isLoading && isLogout && (
            <ActivityIndicator size="small" color="#EF4444" style={{ marginLeft: 8 }} />
          )}
        </View>
        {!isLogout && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
      </TouchableOpacity>
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
          Profile
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View className="mx-6 mt-6 mb-4">
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--primary)' + '20' }}
            >
              <Ionicons name="person" size={48} style={{ color: 'var(--primary)' }} />
            </View>
            <Text className="text-xl font-bold mb-2" style={{ color: 'var(--secondary)' }}>
              {user?.name || 'User Name'}
            </Text>
            <Text className="text-sm text-gray-500 mb-1">
              {user?.email || 'user@example.com'}
            </Text>
            <View className="flex-row items-center mt-2 px-3 py-1 bg-green-50 rounded-full">
              <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              <Text className="text-xs text-green-600 font-medium">Active</Text>
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View className="mx-6 mb-4">
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {profileOptions.filter(option => option.id !== '5').map(renderProfileOption)}
          </View>
        </View>

        {/* Logout Section */}
        <View className="mx-6 mb-6">
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {profileOptions.filter(option => option.id === '5').map(renderProfileOption)}
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold" style={{ color: 'var(--secondary)' }}>
                Change Password
              </Text>
              <TouchableOpacity onPress={closeModal} className="p-1">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Old Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2" style={{ color: 'var(--secondary)' }}>
                Current Password
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3">
                <TextInput
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter current password"
                  className="flex-1 text-base"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                  <Ionicons
                    name={showOldPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2" style={{ color: 'var(--secondary)' }}>
                New Password
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3">
                <TextInput
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password (min 6 characters)"
                  className="flex-1 text-base"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`p-4 rounded-xl mb-3 items-center justify-center ${isLoading ? 'bg-gray-400' : 'bg-primary'
                }`}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold ml-2">Changing Password...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-base">Change Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeModal}
              disabled={isLoading}
              className="p-4 rounded-xl border border-gray-200"
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              <Text className="text-center text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}