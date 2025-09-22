import { Visitor } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

export default function VisitorCard({ visitor }: { visitor: Visitor }) {
  return (
    <View className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center">
        <Image
          source={{ uri: visitor.image }}
          className="w-12 h-12 rounded-full mr-4"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{visitor.name}</Text>
          <View className="flex-row mt-1">
            <View className="flex-1">
              <Text className="text-sm text-gray-600">{visitor.date}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-600">{visitor.time}</Text>
            </View>
          </View>
        </View>
        <View className="ml-4">
          <Ionicons
            name={visitor.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={visitor.status === 'accepted' ? '#10B981' : '#EF4444'}
          />
        </View>
      </View>
    </View>
  );
}