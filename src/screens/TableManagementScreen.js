import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
  Modal
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getTables, updateTableStatus } from '../services/dataService';
import { useFocusEffect } from '@react-navigation/native';

const TableManagementScreen = ({ navigation }) => {
  const { state, setTables } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const tableStatuses = [
    { key: 'available', label: 'Boş', color: '#27ae60', icon: '✓' },
    { key: 'occupied', label: 'Dolu', color: '#e74c3c', icon: '👥' },
    { key: 'reserved', label: 'Rezerve', color: '#f39c12', icon: '📅' },
    { key: 'cleaning', label: 'Temizleniyor', color: '#9b59b6', icon: '🧹' },
    { key: 'maintenance', label: 'Bakımda', color: '#95a5a6', icon: '🔧' }
  ];

  const loadTables = async () => {
    try {
      const tables = await getTables();
      setTables(tables);
    } catch (error) {
      console.error('Error loading tables:', error);
      Alert.alert('Hata', 'Masalar yüklenirken hata oluştu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTables();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadTables();
    }, [])
  );

  const getStatusInfo = (status) => {
    return tableStatuses.find(s => s.key === status) || tableStatuses[0];
  };

  const handleTablePress = (table) => {
    setSelectedTable(table);
    setShowStatusModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTable) return;

    try {
      const result = await updateTableStatus(selectedTable.id, newStatus);
      if (result.success) {
        await loadTables();
        setShowStatusModal(false);
        setSelectedTable(null);
        Alert.alert('Başarılı', 'Masa durumu güncellendi');
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      Alert.alert('Hata', 'Masa durumu güncellenirken hata oluştu');
    }
  };

  const getStatusCounts = () => {
    const counts = {};
    tableStatuses.forEach(status => {
      counts[status.key] = state.tables.filter(table => table.status === status.key).length;
    });
    return counts;
  };

  const renderTableItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity
        style={[styles.tableItem, { borderLeftColor: statusInfo.color }]}
        onPress={() => handleTablePress(item)}
      >
        <View style={styles.tableHeader}>
          <View style={styles.tableInfo}>
            <Text style={styles.tableName}>Masa {item.number}</Text>
            <Text style={styles.tableCapacity}>{item.capacity} kişilik</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        
        {item.currentOrder && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderText}>
              Sipariş: #{item.currentOrder.id} - {item.currentOrder.waiterName}
            </Text>
            <Text style={styles.orderTime}>
              {new Date(item.currentOrder.createdAt).toLocaleTimeString('tr-TR')}
            </Text>
          </View>
        )}
        
        <View style={styles.tableFooter}>
          <Text style={styles.lastUpdated}>
            Son güncelleme: {new Date(item.lastUpdated || Date.now()).toLocaleString('tr-TR')}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleTablePress(item)}
          >
            <Text style={styles.editButtonText}>Durumu Değiştir</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Masa {selectedTable?.number} Durumu
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowStatusModal(false);
                setSelectedTable(null);
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.statusList}>
            <Text style={styles.sectionTitle}>Durum Seçin:</Text>
            
            {tableStatuses.map((status) => (
              <TouchableOpacity
                key={status.key}
                style={[
                  styles.statusOption,
                  selectedTable?.status === status.key && styles.currentStatusOption
                ]}
                onPress={() => handleStatusChange(status.key)}
              >
                <View style={styles.statusOptionContent}>
                  <View style={[styles.statusIndicator, { backgroundColor: status.color }]}>
                    <Text style={styles.statusOptionIcon}>{status.icon}</Text>
                  </View>
                  <View style={styles.statusOptionText}>
                    <Text style={styles.statusOptionLabel}>{status.label}</Text>
                    <Text style={styles.statusOptionDescription}>
                      {getStatusDescription(status.key)}
                    </Text>
                  </View>
                  {selectedTable?.status === status.key && (
                    <View style={styles.currentIndicator}>
                      <Text style={styles.currentIndicatorText}>Mevcut</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const getStatusDescription = (status) => {
    const descriptions = {
      available: 'Masa müşteri kabul etmeye hazır',
      occupied: 'Masa şu anda müşteri tarafından kullanılıyor',
      reserved: 'Masa belirli bir zaman için rezerve edilmiş',
      cleaning: 'Masa temizleniyor, yakında hazır olacak',
      maintenance: 'Masa bakımda, kullanıma kapalı'
    };
    return descriptions[status] || '';
  };

  const statusCounts = getStatusCounts();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Masa Yönetimi</Text>
            <Text style={styles.subtitle}>{state.tables.length} masa</Text>
          </View>
          <View style={styles.headerStats}>
            <Text style={styles.statsText}>
              {statusCounts.available} Boş
            </Text>
          </View>
        </View>
      </View>

      {/* Status Summary */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.statusSummary}
      >
        {tableStatuses.map((status) => (
          <View key={status.key} style={[styles.summaryCard, { borderColor: status.color }]}>
            <View style={[styles.summaryIcon, { backgroundColor: status.color }]}>
              <Text style={styles.summaryIconText}>{status.icon}</Text>
            </View>
            <Text style={styles.summaryCount}>{statusCounts[status.key]}</Text>
            <Text style={styles.summaryLabel}>{status.label}</Text>
          </View>
        ))}
      </ScrollView>

      <FlatList
        data={state.tables}
        renderItem={renderTableItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.tablesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Masa bulunamadı</Text>
          </View>
        }
      />

      {renderStatusModal()}
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerInfo: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 2,
  },
  headerStats: {
    alignItems: 'center',
  },
  statsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusSummary: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  summaryCard: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#f8f9fa',
    minWidth: 70,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryIconText: {
    fontSize: 14,
    color: '#fff',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  tablesList: {
    padding: 15,
  },
  tableItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  tableCapacity: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusIcon: {
    fontSize: 12,
    color: '#fff',
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  orderInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  orderText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  orderTime: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
  tableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 10,
    color: '#7f8c8d',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    backgroundColor: '#f8f9fa',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  statusList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statusOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentStatusOption: {
    borderColor: '#3498db',
    backgroundColor: '#e8f4fd',
  },
  statusOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statusOptionIcon: {
    fontSize: 16,
    color: '#fff',
  },
  statusOptionText: {
    flex: 1,
  },
  statusOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  statusOptionDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 16,
  },
  currentIndicator: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentIndicatorText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
});

export default TableManagementScreen; 