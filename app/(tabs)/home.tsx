import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AcceptRejectModal from '../../components/AcceptRejectModal';
import { useUser } from '../../hooks/useUser';

interface Visitor {
  id: string;
  name: string;
  photo: string;
  date: string;
  time: string;
  status: 'accepted' | 'rejected' | 'pending';
  visitor_id?: number;
  owner_id?: number;
  detected_label?: string;
  image_url?: string;
}

interface PendingRequest {
  id: string;
  name: string;
  photos: string[];
}

// API Base URL - should match your useUser.tsx
const API_BASE_URL = 'https://iot-lock-backend.onrender.com';

export default function HomeScreen() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();

  const fetchVisitors = async (page = 1, isRefresh = false) => {
    if (!user?.id || !user?.access_token) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
        setError(null);
      } else if (page === 1) {
        setIsLoading(true);
        setError(null);
      }

      const response = await fetch(`${API_BASE_URL}/api/visits/${user.id}?page=${page}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Transform API response to match our Visitor interface
        const transformedData: Visitor[] = data.visits?.map((visit: any) => ({
          id: visit.id.toString(),
          name: visit.visitor_name || 'Unknown Visitor',
          photo: visit.profile_image_url || visit.image_url || 'https://i.pravatar.cc/150?img=1',
          date: visit.timestamp ? new Date(visit.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
          time: visit.timestamp ? new Date(visit.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          status: visit.status === 'granted' || visit.status === 'approved' ? 'accepted' : 
                  visit.status === 'rejected' || visit.status === 'denied' ? 'rejected' : 
                  visit.status === 'pending' ? 'pending' : 'pending',
          visitor_id: visit.visitor_id,
          owner_id: visit.owner_id,
          detected_label: visit.detected_label,
          image_url: visit.image_url,
        })) || [];

        if (isRefresh || page === 1) {
          setVisitors(transformedData);
        } else {
          setVisitors(prev => [...prev, ...transformedData]);
        }

        // Check if there's more data (assuming you have pagination info in response)
        const totalVisits = data.total_visits || 0;
        const currentVisitCount = isRefresh || page === 1 ? transformedData.length : visitors.length + transformedData.length;
        setHasMoreData(currentVisitCount < totalVisits);
      } else {
        throw new Error(data.detail || data.message || 'Failed to fetch visitors');
      }
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch visitors');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAcceptReject = async (visitorId: string, action: 'accepted' | 'rejected') => {
    if (!user?.access_token) {
      return;
    }

    try {
      // Choose the correct API endpoint based on action
      const endpoint = action === 'accepted' 
        ? `${API_BASE_URL}/api/visits/approve/${visitorId}`
        : `${API_BASE_URL}/api/visits/deny/${visitorId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Update local state based on the response
        const newStatus = data.visit.status === 'granted' || data.visit.status === 'approved' ? 'accepted' : 'rejected';
        
        setVisitors(prev => 
          prev.map(visitor => 
            visitor.id === visitorId 
              ? { ...visitor, status: newStatus }
              : visitor
          )
        );

        // Clear any previous errors
        setError(null);
        
        // Show success message
        Alert.alert(
          'Success', 
          `Visitor ${action === 'accepted' ? 'approved' : 'denied'} successfully`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(data.message || data.detail || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating visitor status:', error);
      setError(`Failed to ${action === 'accepted' ? 'approve' : 'deny'} visitor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle status update from modal
  const handleModalStatusUpdate = (visitorId: string, status: 'accepted' | 'rejected') => {
    setVisitors(prev => 
      prev.map(visitor => 
        visitor.id === visitorId 
          ? { ...visitor, status: status }
          : visitor
      )
    );
    // Clear any error when successful update from modal
    setError(null);
  };

  const onRefresh = useCallback(() => {
    setCurrentPage(1);
    setHasMoreData(true);
    fetchVisitors(1, true);
  }, [user]);

  const loadMore = () => {
    if (hasMoreData && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchVisitors(nextPage);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchVisitors(1);
    }
  }, [user]);

  const openPendingModal = (visitor: Visitor) => {
    setPendingRequest({
      id: visitor.id,
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
            defaultSource={{ uri: 'https://i.pravatar.cc/150?img=1' }}
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

  const pendingVisitors = visitors.filter(v => v.status === 'pending');

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">Please login to view visitors</Text>
      </SafeAreaView>
    );
  }

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

      {error && (
        <View className="bg-destructive/10 mx-5 mt-4 p-4 rounded-xl border border-destructive/20">
          <Text className="text-destructive text-sm font-medium">
            {error}
          </Text>
          <TouchableOpacity 
            className="mt-2"
            onPress={() => fetchVisitors(1, true)}
          >
            <Text className="text-destructive text-sm underline">
              Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={visitors}
        renderItem={renderVisitorCard}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerClassName="p-5 pb-24"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoading && currentPage > 1 ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : hasMoreData && visitors.length > 0 ? (
            <TouchableOpacity 
              className="bg-primary p-4 rounded-xl items-center mt-4 shadow-sm"
              onPress={loadMore}
            >
              <Text className="text-primary-foreground text-base font-semibold">
                Load More
              </Text>
            </TouchableOpacity>
          ) : visitors.length > 0 ? (
            <View className="items-center mt-8 pb-4">
              <Text className="text-muted-foreground text-sm">
                You've reached the end
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-muted-foreground text-base mt-4">
                Loading visitors...
              </Text>
            </View>
          ) : (
            <View className="items-center justify-center py-20">
              <Ionicons name="people-outline" size={64} color="#e5e5e6" />
              <Text className="text-muted-foreground text-lg font-medium mt-4">
                No visitors yet
              </Text>
              <Text className="text-muted text-sm mt-1">
                Visitor history will appear here
              </Text>
            </View>
          )
        }
      />

      <AcceptRejectModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        visitorData={pendingRequest}
        onStatusUpdate={handleModalStatusUpdate}
      />
    </SafeAreaView>
  );
}