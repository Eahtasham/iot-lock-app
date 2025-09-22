import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AcceptRejectModal from '../../components/AcceptRejectModal';

interface Visitor {
  id: string;
  name: string;
  photo: string;
  date: string;
  time: string;
  status: 'accepted' | 'rejected';
}

const mockVisitors: Visitor[] = [
  {
    id: '1',
    name: 'John Doe',
    photo: 'https://i.pravatar.cc/150?img=1',
    date: '2024-01-15',
    time: '10:30 AM',
    status: 'accepted'
  },
  {
    id: '2',
    name: 'Jane Smith',
    photo: 'https://i.pravatar.cc/150?img=2',
    date: '2024-01-15',
    time: '2:45 PM',
    status: 'rejected'
  },
  // Add more mock data...
];

interface PendingRequest {
  name: string;
  photos: string[];
}

export default function HomeScreen() {
  const [visitors, setVisitors] = useState(mockVisitors);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);

  const renderVisitorCard = ({ item }: { item: Visitor }) => (
    <View style={styles.visitorCard}>
      <Image source={{ uri: item.photo }} style={styles.visitorPhoto} />
      
      <View style={styles.visitorInfo}>
        <Text style={styles.visitorName}>{item.name}</Text>
        <View style={styles.visitorDetails}>
          <Text style={styles.visitorDate}>{item.date}</Text>
          <Text style={styles.visitorTime}>{item.time}</Text>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <Ionicons
          name={item.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={item.status === 'accepted' ? '#4CAF50' : '#F44336'}
        />
      </View>
    </View>
  );

  const loadMore = () => {
    // Simulate loading more data
    setCurrentPage(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visitor History</Text>
      </View>
      
      <FlatList
        data={visitors.slice(0, currentPage * 10)}
        renderItem={renderVisitorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          visitors.length > currentPage * 10 ? (
            <TouchableOpacity style={styles.seeMoreButton} onPress={loadMore}>
              <Text style={styles.seeMoreText}>See More</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <AcceptRejectModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        visitorData={pendingRequest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  visitorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visitorPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  visitorInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  visitorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visitorDate: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  visitorTime: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusContainer: {
    marginLeft: 16,
  },
  seeMoreButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  seeMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});