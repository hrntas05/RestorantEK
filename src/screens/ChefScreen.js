import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getOrders, updateOrderStatus } from '../services/dataService';
import { useFocusEffect } from '@react-navigation/native';

const ChefScreen = () => {
  const { state, setOrders } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, preparing

  const loadOrders = async () => {
    try {
      const orders = await getOrders();
      setOrders(orders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Hata', 'Siparişler yüklenirken hata oluştu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        await loadOrders(); // Refresh orders
        
        let message = '';
        switch (newStatus) {
          case 'preparing':
            message = 'Sipariş hazırlanmaya başlandı';
            break;
          case 'ready':
            message = 'Sipariş hazır';
            break;
          case 'completed':
            message = 'Sipariş tamamlandı';
            break;
        }
        Alert.alert('Başarılı', message);
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Hata', 'Sipariş durumu güncellenirken hata oluştu');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#e74c3c';
      case 'preparing':
        return '#f39c12';
      case 'ready':
        return '#27ae60';
      case 'completed':
        return '#95a5a6';
      default:
        return '#bdc3c7';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'preparing':
        return 'Hazırlanıyor';
      case 'ready':
        return 'Hazır';
      case 'completed':
        return 'Tamamlandı';
      default:
        return 'Bilinmiyor';
    }
  };

  const getFilteredOrders = () => {
    let filtered = state.orders;
    
    if (filter === 'pending') {
      filtered = filtered.filter(order => order.status === 'pending');
    } else if (filter === 'preparing') {
      filtered = filtered.filter(order => order.status === 'preparing');
    } else if (filter === 'active') {
      filtered = filtered.filter(order => ['pending', 'preparing', 'ready'].includes(order.status));
    }
    
    return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateDuration = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} dk`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}s ${minutes}dk`;
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.tableNumber}>Masa {item.tableNumber}</Text>
          <Text style={styles.waiterName}>{item.waiterName}</Text>
        </View>
        <View style={styles.orderMeta}>
          <Text style={styles.orderTime}>{formatTime(item.createdAt)}</Text>
          <Text style={styles.orderDuration}>{calculateDuration(item.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
            <Text style={styles.itemName}>{orderItem.name}</Text>
          </View>
        ))}
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Not:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleStatusUpdate(item.id, 'preparing')}
          >
            <Text style={styles.actionButtonText}>Hazırlamaya Başla</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'preparing' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.readyButton]}
            onPress={() => handleStatusUpdate(item.id, 'ready')}
          >
            <Text style={styles.actionButtonText}>Hazır</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'ready' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleStatusUpdate(item.id, 'completed')}
          >
            <Text style={styles.actionButtonText}>Teslim Edildi</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Şef Paneli</Text>
        <Text style={styles.subtitle}>Aktif Siparişler</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Tümü ({state.orders.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
            Aktif ({state.orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
            Bekleyen ({state.orders.filter(o => o.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'preparing' && styles.activeFilter]}
          onPress={() => setFilter('preparing')}
        >
          <Text style={[styles.filterText, filter === 'preparing' && styles.activeFilterText]}>
            Hazırlanan ({state.orders.filter(o => o.status === 'preparing').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz sipariş bulunmuyor</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    marginTop: 5,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilter: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  waiterName: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  orderTime: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  orderDuration: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemsList: {
    marginBottom: 15,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    width: 40,
  },
  itemName: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#f39c12',
  },
  readyButton: {
    backgroundColor: '#27ae60',
  },
  completeButton: {
    backgroundColor: '#3498db',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default ChefScreen; 