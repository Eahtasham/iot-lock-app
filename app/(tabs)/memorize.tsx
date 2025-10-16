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

const BASE_URL = "https://iot-lock-backend.onrender.com";
const API_KEY = "supersecret123";

export default function MemorizeScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pick image from gallery
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
      const newPhoto: Photo = { id: Date.now().toString(), uri: result.assets[0].uri };
      setPhotos(prev => [...prev, newPhoto]);
    }
  };

  // Take photo with camera
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
      const newPhoto: Photo = { id: Date.now().toString(), uri: result.assets[0].uri };
      setPhotos(prev => [...prev, newPhoto]);
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  // Upload single photo
  const uploadImageToAPI = async (photo: Photo): Promise<string> => {
    const formData = new FormData();
    formData.append("file", {
      uri: photo.uri,
      name: `photo_${photo.id}.jpg`,
      type: "image/jpeg",
    } as any);

    const response = await fetch(`${BASE_URL}/upload/upload-image`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${photo.id}`);
    }

    const data = await response.json();
    console.log("Upload response for photo", photo.id, ":", data);
    return data.url;
  };

  // Handle memorize action
  const handleMemorize = async () => {
    if (photos.length === 0 || !name.trim()) {
      Alert.alert('Error', 'Please add at least one photo and enter a name');
      return;
    }
    setIsLoading(true);
    try {
      const uploadedUrls: string[] = [];

      // Upload photos
      for (const photo of photos) {
        const url = await uploadImageToAPI(photo);
        uploadedUrls.push(url);
      }

      // Concatenate URLs
      const concatenatedUrls = uploadedUrls.join("=@#*#@=");
      console.log("Concatenated URLs:", concatenatedUrls);

      // Create visitor
      const visitorResponse = await fetch(`${BASE_URL}/api/visitors/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          name: name,
          profile_image_url: concatenatedUrls,
        }),
      });

      if (!visitorResponse.ok) {
        throw new Error("Failed to create visitor");
      }

      const visitorData = await visitorResponse.json();
      console.log("Visitor created:", visitorData);

      Alert.alert(
        "Success",
        `Uploaded ${uploadedUrls.length} photo(s) and saved visitor ${name}`
      );

      // Reset
      setPhotos([]);
      setName("");

    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 py-4 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground mb-1">Memorize Face</Text>
        <Text className="text-sm text-muted-foreground">
          Add photos and name to memorize a person
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        {/* Photos Section */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Photos ({photos.length})
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pr-5">
            {/* Add photo button */}
            <TouchableOpacity
              className="w-28 h-28 bg-card rounded-xl border-2 border-primary border-dashed justify-center items-center mr-3"
              onPress={showImageSourceOptions}
              disabled={isLoading}
            >
              <Ionicons name="camera" size={28} color="#3b82f6" />
              <Text className="text-primary text-xs mt-2 font-medium">Add Photo</Text>
            </TouchableOpacity>

            {photos.map((photo, index) => (
              <View key={photo.id} className="relative mr-3">
                <Image source={{ uri: photo.uri }} className="w-28 h-28 rounded-xl bg-muted" />
                <View className="absolute bottom-1 left-1 bg-black/60 rounded px-2 py-0.5">
                  <Text className="text-white text-[10px] font-bold">{index + 1}</Text>
                </View>
                <TouchableOpacity
                  className="absolute -top-2 -right-2 bg-card rounded-full shadow p-0.5"
                  onPress={() => removePhoto(photo.id)}
                  disabled={isLoading}
                >
                  <Ionicons name="close-circle" size={22} color="#f4212e" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {photos.length > 0 && (
            <Text className="text-xs text-muted-foreground mt-3 italic">
              Tip: Add multiple photos from different angles for better recognition
            </Text>
          )}
        </View>

        {/* Name Section */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-foreground mb-3">Name</Text>
          <TextInput
            className={`bg-card rounded-xl px-4 py-3 text-base border border-border ${isLoading ? 'bg-muted text-muted-foreground' : ''}`}
            placeholder="Enter person's name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
            editable={!isLoading}
          />
        </View>

        {/* Memorize Button */}
        <TouchableOpacity
          className={`rounded-xl p-4 items-center mb-5 ${isLoading ? 'bg-muted' : 'bg-primary'}`}
          onPress={handleMemorize}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white text-base font-semibold ml-2">Uploading...</Text>
            </View>
          ) : (
            <Text className="text-primary-foreground text-base font-semibold">
              Memorize {photos.length > 0 ? `(${photos.length} photo${photos.length !== 1 ? 's' : ''})` : ''}
            </Text>
          )}
        </TouchableOpacity>

        {/* Preview Section */}
        {photos.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-semibold text-foreground mb-3">Preview</Text>
            <View className="bg-card rounded-xl p-4 flex-row items-center border border-border">
              <Image source={{ uri: photos[0].uri }} className="w-14 h-14 rounded-full mr-4" />
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground mb-1">
                  {name || 'Enter name above'}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
