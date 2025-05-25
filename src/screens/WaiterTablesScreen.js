import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getTables, logout } from '../services/dataService';
import { useFocusEffect } from '@react-navigation/native';

const WaiterTablesScreen = ({ navigation }) => {
  const { state, setTables, setSelectedTable, logout: contextLogout } = useApp();
  const [refreshing, setRefreshing] = useState(false);

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

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    navigation.navigate('Menu');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            contextLogout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#27ae60';
      case 'occupied':
        return '#e74c3c';
      case 'reserved':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  const getTableStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Boş';
      case 'occupied':
        return 'Dolu';
      case 'reserved':
        return 'Rezerve';
      default:
        return 'Bilinmiyor';
    }
  };

  const renderTableItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tableCard,
        { borderColor: getTableStatusColor(item.status) }
      ]}
      onPress={() => handleTableSelect(item)}
      disabled={item.status === 'occupied'}
    >
      <View style={styles.tableNumber}>
        <Text style={styles.tableNumberText}>{item.number}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        { backgroundColor: getTableStatusColor(item.status) }
      ]}>
        <Text style={styles.statusText}>{getTableStatusText(item.status)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Masa Seçimi</Text>
            <Text style={styles.subtitle}>Hoş geldiniz, {state.user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>Sipariş almak için bir masa seçin:</Text>
        
        <FlatList
          data={state.tables}
          renderItem={renderTableItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.tablesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz masa bulunmuyor</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  tablesList: {
    flexGrow: 1,
  },
  tableCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableNumber: {
    marginBottom: 15,
  },
  tableNumberText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
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

export default WaiterTablesScreen; 