import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface AcceptRejectModalProps {
  visible: boolean;
  onClose: () => void;
  visitorData: {
    name: string;
    photos: string[];
  } | null;
}

const mockPhotos = [
  'https://i.pravatar.cc/300?img=3',
  'https://i.pravatar.cc/300?img=4',
  'https://i.pravatar.cc/300?img=5',
];

export default function AcceptRejectModal({ 
  visible, 
  onClose, 
  visitorData 
}: AcceptRejectModalProps) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Auto-trigger modal after 10 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setModalVisible(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const photos = visitorData?.photos || mockPhotos;

  const scrollToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      scrollToPhoto(currentPhotoIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      scrollToPhoto(currentPhotoIndex + 1);
    }
  };

  const handleAccept = () => {
    console.log('Visitor accepted');
    setModalVisible(false);
    onClose();
  };

  const handleReject = () => {
    console.log('Visitor rejected');
    setModalVisible(false);
    onClose();
  };

  const handleClose = () => {
    setModalVisible(false);
    onClose();
  };

  return (
    <Modal
      visible={modalVisible || visible} // Show if auto-triggered OR manually triggered
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Visitor Request</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Someone is at your door</Text>
          
          <View style={styles.photosSection}>
            <View style={styles.photoSliderContainer}>
              <TouchableOpacity 
                style={[styles.arrowButton, styles.leftArrow, { opacity: currentPhotoIndex === 0 ? 0.3 : 1 }]}
                onPress={handlePrevPhoto}
                disabled={currentPhotoIndex === 0}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosContainer}
                pagingEnabled
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                  setCurrentPhotoIndex(index);
                }}
              >
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                  </View>
                ))}
              </ScrollView>
              
              <TouchableOpacity 
                style={[styles.arrowButton, styles.rightArrow, { opacity: currentPhotoIndex === photos.length - 1 ? 0.3 : 1 }]}
                onPress={handleNextPhoto}
                disabled={currentPhotoIndex === photos.length - 1}
              >
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.photoIndicators}>
              {photos.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.indicator,
                    { backgroundColor: index === currentPhotoIndex ? '#007AFF' : '#ccc' }
                  ]} 
                />
              ))}
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  photosSection: {
    marginBottom: 40,
    position: 'relative',
  },
  photoSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  photosContainer: {
    alignItems: 'center',
  },
  photoWrapper: {
    width: screenWidth - 40,
    alignItems: 'center',
  },
  photo: {
    width: screenWidth - 80,
    height: screenWidth - 80,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  photoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
    backgroundColor: '#ccc',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 20,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF5252',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});