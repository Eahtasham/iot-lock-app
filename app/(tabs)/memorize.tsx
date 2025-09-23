import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Photo {
  id: string;
  uri: string;
}

// Mock API function
const mockMemorizeAPI = async (name: string, photos: Photo[]): Promise<{ success: boolean; message: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate random success/failure for demo purposes
  const isSuccess = Math.random() > 0.1; // 90% success rate
  
  if (isSuccess) {
    return {
      success: true,
      message: `Successfully memorized ${name} with ${photos.length} photo(s). Face recognition model updated.`
    };
  } else {
    return {
      success: false,
      message: 'Failed to process photos. Please try again with clearer images.'
    };
  }
};

export default function MemorizeScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
      };
      setPhotos(prev => [...prev, newPhoto]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
      };
      setPhotos(prev => [...prev, newPhoto]);
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: takePhoto,
        },
        {
          text: 'Photo Library',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const handleMemorize = async () => {
    if (photos.length === 0 || !name.trim()) {
      Alert.alert('Error', 'Please add at least one photo and enter a name');
      return;
    }

    setIsLoading(true);

    try {
      const result = await mockMemorizeAPI(name.trim(), photos);
      
      if (result.success) {
        Alert.alert(
          'Success',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                setPhotos([]);
                setName('');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-5 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-secondary mb-1">Memorize Face</Text>
        <Text className="text-sm text-gray-500">Add photos and name to memorize a person</Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-lg font-semibold text-secondary mb-4">Photos</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <TouchableOpacity 
              className="w-30 h-30 bg-white rounded-xl border-2 border-primary p-4 border-dashed justify-center items-center mr-3" 
              onPress={showImageSourceOptions}
            >
              <Ionicons name="camera" size={30} color="var(--primary)" />
              <Text className="text-primary text-xs mt-2 font-medium">Add Photo</Text>
            </TouchableOpacity>

            {photos.map((photo) => (
              <View key={photo.id} className="relative mr-3">
                <Image source={{ uri: photo.uri }} className="w-30 h-30 rounded-xl" />
                <TouchableOpacity
                  className="absolute -top-2 -right-2 bg-white rounded-xl"
                  onPress={() => removePhoto(photo.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-secondary mb-4">Name</Text>
          <TextInput
            className="bg-white rounded-xl p-4 text-base border border-gray-200"
            placeholder="Enter person's name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity 
          className={`rounded-xl p-5 items-center mb-5 ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
          onPress={handleMemorize}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white text-lg font-semibold ml-2">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-semibold">Memorize</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}