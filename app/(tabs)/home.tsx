import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
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
  status: 'accepted' | 'rejected' | 'pending';
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
  {
    id: '3',
    name: 'Alice Johnson',
    photo: 'https://i.pravatar.cc/150?img=3',
    date: '2024-01-16',
    time: '9:15 AM',
    status: 'pending'
  },
  {
    id: '4',
    name: 'Bob Wilson',
    photo: 'https://i.pravatar.cc/150?img=4',
    date: '2024-01-16',
    time: '11:30 AM',
    status: 'pending'
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

  const handleAcceptReject = (visitorId: string, action: 'accepted' | 'rejected') => {
    setVisitors(prev => 
      prev.map(visitor => 
        visitor.id === visitorId 
          ? { ...visitor, status: action }
          : visitor
      )
    );
  };

  const openPendingModal = (visitor: Visitor) => {
    setPendingRequest({
      name: visitor.name,
      photos: [visitor.photo]
    });
    setShowModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return { name: 'checkmark-circle' as const, color: 'text-chart-2' };
      case 'rejected':
        return { name: 'close-circle' as const, color: 'text-destructive' };
      case 'pending':
        return { name: 'time-outline' as const, color: 'text-chart-3' };
      default:
        return { name: 'help-circle' as const, color: 'text-muted-foreground' };
    }
  };

  const renderVisitorCard = ({ item }: { item: Visitor }) => {
    const statusIcon = getStatusIcon(item.status);
    
    return (
      <TouchableOpacity 
        className="bg-card rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-border"
        onPress={() => item.status === 'pending' ? openPendingModal(item) : null}
        activeOpacity={item.status === 'pending' ? 0.7 : 1}
      >
        <View className="relative">
          <Image 
            source={{ uri: item.photo }} 
            className="w-14 h-14 rounded-full mr-4" 
          />
          {item.status === 'pending' && (
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-chart-3 rounded-full border-2 border-background" />
          )}
        </View>
        
        <View className="flex-1">
          <Text className="text-base font-semibold text-card-foreground mb-1">
            {item.name}
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted-foreground flex-1">
              {item.date}
            </Text>
            <Text className="text-sm text-muted-foreground flex-1">
              {item.time}
            </Text>
          </View>
          {item.status === 'pending' && (
            <Text className="text-xs text-chart-3 mt-1 font-medium">
              Tap to review
            </Text>
          )}
        </View>
        
        <View className="ml-4">
          {item.status === 'pending' ? (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-chart-2 rounded-full p-2"
                onPress={() => handleAcceptReject(item.id, 'accepted')}
              >
                <Ionicons name="checkmark" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-destructive rounded-full p-2"
                onPress={() => handleAcceptReject(item.id, 'rejected')}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className={`${statusIcon.color}`}>
              <Ionicons
                name={statusIcon.name}
                size={24}
                color={item.status === 'accepted' ? '#00b87a' : '#f4212e'}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const loadMore = () => {
    // Simulate loading more data
    setCurrentPage(prev => prev + 1);
  };

  const pendingVisitors = visitors.filter(v => v.status === 'pending');
  const allVisitors = visitors.slice(0, currentPage * 10);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 py-4 bg-card border-b border-border">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-foreground">
            Visitor History
          </Text>
          {pendingVisitors.length > 0 && (
            <View className="bg-accent px-3 py-1 rounded-full">
              <Text className="text-accent-foreground text-sm font-medium">
                {pendingVisitors.length} pending
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-muted-foreground">
          Manage your visitor requests and history
        </Text>
      </View>
      
      {pendingVisitors.length > 0 && (
        <View className="bg-accent mx-5 mt-4 p-4 rounded-xl border border-border">
          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={20} color="#f7b928" />
            <Text className="ml-2 text-accent-foreground font-semibold">
              Pending Requests ({pendingVisitors.length})
            </Text>
          </View>
          <Text className="text-accent-foreground text-sm">
            You have {pendingVisitors.length} visitor request{pendingVisitors.length !== 1 ? 's' : ''} waiting for approval
          </Text>
        </View>
      )}
      
      <FlatList
        data={allVisitors}
        renderItem={renderVisitorCard}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerClassName="p-5 pb-24"
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          visitors.length > currentPage * 10 ? (
            <TouchableOpacity 
              className="bg-primary p-4 rounded-xl items-center mt-4 shadow-sm"
              onPress={loadMore}
            >
              <Text className="text-primary-foreground text-base font-semibold">
                See More
              </Text>
            </TouchableOpacity>
          ) : (
            allVisitors.length > 0 ? (
              <View className="items-center mt-8 pb-4">
                <Text className="text-muted-foreground text-sm">
                  You've reached the end
                </Text>
              </View>
            ) : null
          )
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="people-outline" size={64} color="#e5e5e6" />
            <Text className="text-muted-foreground text-lg font-medium mt-4">
              No visitors yet
            </Text>
            <Text className="text-muted text-sm mt-1">
              Visitor history will appear here
            </Text>
          </View>
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