import React, { useState } from 'react';
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useUser } from '../hooks/useUser';
import NotificationService from '../services/notificationService';

export default function NotificationTest() {
  const { user, expoPushToken } = useUser();
  const [testMessage, setTestMessage] = useState('');
  const API_BASE_URL = 'https://iot-lock-backend.onrender.com'; // Your backend URL

  // Test local notification
  const testLocalNotification = async () => {
    await NotificationService.scheduleLocalNotification(
      '🔔 Test Local Notification',
      'This is a local notification test',
      { test: true, timestamp: new Date().toISOString() },
      2 // Trigger after 2 seconds
    );
    Alert.alert('Success', 'Local notification scheduled! It will appear in 2 seconds.');
  };

  // Test server notification
  const testServerNotification = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notify/test/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Test notification sent from server!');
        console.log('Server notification result:', data);
      } else {
        Alert.alert('Error', data.detail || 'Failed to send notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
      console.error('Test notification error:', error);
    }
  };

  // Simulate Raspberry Pi visitor detection
  const simulateVisitorDetection = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/raspberry-pi/visitor-detected`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({
            owner_id: parseInt(user.id),
            visitor_name: testMessage || 'John Doe',
            image_url: 'https://example.com/visitor-image.jpg',
            detected_label: 'person',
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Visitor detection notification sent!');
        console.log('Visitor notification result:', data);
      } else {
        Alert.alert('Error', data.detail || 'Failed to send visitor notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
      console.error('Visitor detection error:', error);
    }
  };

  // Check notification status
  const checkNotificationStatus = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/status/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Notification Status',
          `Notifications Enabled: ${data.notifications_enabled}\n` +
          `Registered Devices: ${data.registered_devices}\n` +
          `Devices: ${JSON.stringify(data.devices, null, 2)}`
        );
      } else {
        Alert.alert('Error', data.detail || 'Failed to get status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
      console.error('Status check error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Notification Testing</Text>

        <View style={styles.infoSection}>
          <Text style={styles.label}>User:</Text>
          <Text style={styles.value}>{user?.name || 'Not logged in'}</Text>

          <Text style={styles.label}>Push Token:</Text>
          <Text style={styles.value}>
            {expoPushToken ? `${expoPushToken.substring(0, 30)}...` : 'No token'}
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Test Local Notification"
            onPress={testLocalNotification}
            color="#4CAF50"
          />
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Test Server Notification"
            onPress={testServerNotification}
            color="#2196F3"
            disabled={!user}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Visitor Name (for simulation):</Text>
          <TextInput
            style={styles.input}
            value={testMessage}
            onChangeText={setTestMessage}
            placeholder="Enter visitor name"
          />
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Simulate Visitor Detection (Raspberry Pi)"
            onPress={simulateVisitorDetection}
            color="#FF9800"
            disabled={!user}
          />
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Check Notification Status"
            onPress={checkNotificationStatus}
            color="#9C27B0"
            disabled={!user}
          />
        </View>

        <View style={styles.curlSection}>
          <Text style={styles.sectionTitle}>Test with cURL:</Text>
          <Text style={styles.code}>
            {`curl -X POST "${API_BASE_URL}/api/notifications/raspberry-pi/visitor-detected" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -d '{
    "owner_id": ${user?.id || 'USER_ID'},
    "visitor_name": "Test Visitor",
    "image_url": "https://example.com/image.jpg",
    "detected_label": "person"
  }'`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#666',
  },
  value: {
    fontSize: 14,
    marginTop: 5,
    color: '#333',
  },
  buttonSection: {
    marginVertical: 10,
  },
  inputSection: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: 'white',
  },
  curlSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 4,
  },
});