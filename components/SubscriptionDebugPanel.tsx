import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';

export const SubscriptionDebugPanel = () => {
  const { 
    isActive, 
    subscription, 
    isLoading, 
    refreshStatus,
    daysUntilExpiry 
  } = useSubscriptionStatus();

  const showSubscriptionDetails = () => {
    if (!subscription) {
      Alert.alert('No Subscription', 'No active subscription found.');
      return;
    }

    Alert.alert(
      'Subscription Details',
      `Product: ${subscription.product_id}\n` +
      `Active: ${subscription.is_active ? 'Yes' : 'No'}\n` +
      `Premium: ${subscription.is_premium ? 'Yes' : 'No'}\n` +
      `Source: ${subscription.purchase_source || 'Unknown'}\n` +
      `Purchase: ${subscription.purchase_date ? new Date(subscription.purchase_date).toLocaleDateString() : 'N/A'}\n` +
      `${daysUntilExpiry ? `Expires in: ${daysUntilExpiry} days` : 'No expiry set'}`
    );
  };

  const refreshSubscription = async () => {
    console.log('🔄 Manually refreshing subscription status...');
    await refreshStatus();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading subscription status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Subscription Debug</Text>
        <TouchableOpacity onPress={refreshSubscription} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: isActive ? '#4CAF50' : '#F44336' }]}>
          {isActive ? '✅ ACTIVE' : '❌ INACTIVE'}
        </Text>
        
        {subscription && (
          <TouchableOpacity onPress={showSubscriptionDetails} style={styles.detailsButton}>
            <Text style={styles.detailsText}>
              📱 {subscription.product_id}
            </Text>
            <Text style={styles.subText}>
              Tap for details
            </Text>
          </TouchableOpacity>
        )}
        
        {!subscription && !isLoading && (
          <Text style={styles.noSubText}>
            No subscription found. Try making a test purchase!
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  refreshText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  detailsButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
  noSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});