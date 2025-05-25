import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useApp } from '../context/AppContext';
import { logout } from '../services/dataService';

const AdminScreen = ({ navigation }) => {
  const { state, logout: contextLogout } = useApp();

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

  const menuItems = [
    {
      title: 'Şef Paneli',
      subtitle: 'Siparişleri görüntüle ve yönet',
      color: '#2c3e50',
      onPress: () => navigation.navigate('Chef')
    },
    {
      title: 'Menü Yönetimi',
      subtitle: 'Menü öğelerini ekle, düzenle, sil',
      color: '#27ae60',
      onPress: () => Alert.alert('Bilgi', 'Menü yönetimi yakında eklenecek')
    },
    {
      title: 'Garson Yönetimi',
      subtitle: 'Garsonları ekle, düzenle, sil',
      color: '#3498db',
      onPress: () => Alert.alert('Bilgi', 'Garson yönetimi yakında eklenecek')
    },
    {
      title: 'Raporlar',
      subtitle: 'Satış raporları ve istatistikler',
      color: '#9b59b6',
      onPress: () => Alert.alert('Bilgi', 'Raporlar yakında eklenecek')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Yönetici Paneli</Text>
            <Text style={styles.subtitle}>Hoş geldiniz, {state.user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuCard, { backgroundColor: item.color }]}
              onPress={item.onPress}
            >
              <Text style={styles.menuCardTitle}>{item.title}</Text>
              <Text style={styles.menuCardSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Hızlı İstatistikler</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{state.orders.length}</Text>
              <Text style={styles.statLabel}>Toplam Sipariş</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {state.orders.filter(o => o.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Bekleyen</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {state.orders.filter(o => o.status === 'preparing').length}
              </Text>
              <Text style={styles.statLabel}>Hazırlanan</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {state.orders.filter(o => o.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8e44ad',
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
  menuGrid: {
    marginBottom: 30,
  },
  menuCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  menuCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default AdminScreen; 