import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  FlatList
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getOrders, getMenuItems } from '../services/dataService';
import { useFocusEffect } from '@react-navigation/native';

const ReportsScreen = ({ navigation }) => {
  const { state, setOrders, setMenuItems } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const periods = [
    { key: 'today', label: 'Bugün' },
    { key: 'week', label: 'Bu Hafta' },
    { key: 'month', label: 'Bu Ay' }
  ];

  const loadData = async () => {
    try {
      const [orders, menuItems] = await Promise.all([
        getOrders(),
        getMenuItems()
      ]);
      setOrders(orders);
      setMenuItems(menuItems);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Hata', 'Veriler yüklenirken hata oluştu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getDateRange = (period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  const getFilteredOrders = () => {
    const { start, end } = getDateRange(selectedPeriod);
    return state.orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate < end && order.status === 'completed';
    });
  };

  const calculateRevenue = (orders) => {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((itemTotal, item) => {
        return itemTotal + (item.price * item.quantity);
      }, 0);
      return total + orderTotal;
    }, 0);
  };

  const getTopSellingItems = (orders) => {
    const itemCounts = {};
    const itemRevenue = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.id]) {
          itemCounts[item.id] = {
            id: item.id,
            name: item.name,
            count: 0,
            revenue: 0
          };
        }
        itemCounts[item.id].count += item.quantity;
        itemCounts[item.id].revenue += item.price * item.quantity;
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getHourlyData = (orders) => {
    const hourlyStats = {};
    
    for (let i = 0; i < 24; i++) {
      hourlyStats[i] = { hour: i, orders: 0, revenue: 0 };
    }
    
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      const orderRevenue = order.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
      
      hourlyStats[hour].orders += 1;
      hourlyStats[hour].revenue += orderRevenue;
    });
    
    return Object.values(hourlyStats).filter(stat => stat.orders > 0);
  };

  const filteredOrders = getFilteredOrders();
  const totalRevenue = calculateRevenue(filteredOrders);
  const topItems = getTopSellingItems(filteredOrders);
  const hourlyData = getHourlyData(filteredOrders);
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  const renderTopItem = ({ item, index }) => (
    <View style={styles.topItemCard}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemStats}>{item.count} adet satıldı</Text>
      </View>
      <View style={styles.itemRevenue}>
        <Text style={styles.revenueText}>{item.revenue.toFixed(2)} ₺</Text>
      </View>
    </View>
  );

  const renderHourlyItem = ({ item }) => (
    <View style={styles.hourlyCard}>
      <Text style={styles.hourText}>{item.hour.toString().padStart(2, '0')}:00</Text>
      <View style={styles.hourlyStats}>
        <Text style={styles.hourlyOrders}>{item.orders} sipariş</Text>
        <Text style={styles.hourlyRevenue}>{item.revenue.toFixed(2)} ₺</Text>
      </View>
    </View>
  );

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
            <Text style={styles.title}>Gelir Raporları</Text>
            <Text style={styles.subtitle}>Satış analizi ve istatistikler</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.key && styles.activePeriodText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Toplam Gelir</Text>
            <Text style={styles.summaryValue}>{totalRevenue.toFixed(2)} ₺</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Sipariş Sayısı</Text>
            <Text style={styles.summaryValue}>{filteredOrders.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ortalama Sipariş</Text>
            <Text style={styles.summaryValue}>{averageOrderValue.toFixed(2)} ₺</Text>
          </View>
        </View>

        {/* Top Selling Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En Çok Satan Ürünler</Text>
          {topItems.length > 0 ? (
            <FlatList
              data={topItems}
              renderItem={renderTopItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Bu dönemde satış bulunmuyor</Text>
            </View>
          )}
        </View>

        {/* Hourly Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saatlik Analiz</Text>
          {hourlyData.length > 0 ? (
            <FlatList
              data={hourlyData}
              renderItem={renderHourlyItem}
              keyExtractor={(item) => item.hour.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyList}
            />
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Bu dönemde satış bulunmuyor</Text>
            </View>
          )}
        </View>

        {/* Detailed Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detaylı İstatistikler</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Toplam Ürün Satışı</Text>
              <Text style={styles.statValue}>
                {filteredOrders.reduce((total, order) => {
                  return total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0);
                }, 0)} adet
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>En Yoğun Saat</Text>
              <Text style={styles.statValue}>
                {hourlyData.length > 0 
                  ? `${hourlyData.sort((a, b) => b.orders - a.orders)[0]?.hour.toString().padStart(2, '0')}:00`
                  : 'Veri yok'
                }
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>En Karlı Saat</Text>
              <Text style={styles.statValue}>
                {hourlyData.length > 0 
                  ? `${hourlyData.sort((a, b) => b.revenue - a.revenue)[0]?.hour.toString().padStart(2, '0')}:00`
                  : 'Veri yok'
                }
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Aktif Masa Sayısı</Text>
              <Text style={styles.statValue}>
                {state.tables.filter(t => t.status === 'occupied').length} masa
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Siparişler</Text>
          {filteredOrders.slice(-5).reverse().map((order, index) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{order.id.slice(-6)}</Text>
                <Text style={styles.orderTime}>
                  {new Date(order.createdAt).toLocaleTimeString('tr-TR')}
                </Text>
              </View>
              <Text style={styles.orderTable}>Masa {order.tableNumber}</Text>
              <Text style={styles.orderTotal}>
                {order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} ₺
              </Text>
            </View>
          ))}
          {filteredOrders.length === 0 && (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Bu dönemde sipariş bulunmuyor</Text>
            </View>
          )}
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
    backgroundColor: '#9b59b6',
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
  headerPlaceholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#9b59b6',
  },
  periodText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  topItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  itemStats: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  itemRevenue: {
    alignItems: 'flex-end',
  },
  revenueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  hourlyList: {
    paddingHorizontal: 5,
  },
  hourlyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  hourText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  hourlyStats: {
    alignItems: 'center',
  },
  hourlyOrders: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  hourlyRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  orderTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  orderTable: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default ReportsScreen; 