import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initialMenuItems, 
  initialTables, 
  initialWaiters, 
  adminUser 
} from '../data/initialData';

// Storage anahtarları
const STORAGE_KEYS = {
  MENU_ITEMS: 'menuItems',
  TABLES: 'tables',
  WAITERS: 'waiters',
  ORDERS: 'orders',
  CURRENT_USER: 'currentUser'
};

// Başlangıç verilerini yükle
export const initializeData = async () => {
  try {
    // Menü öğelerini kontrol et ve yükle
    const existingMenu = await AsyncStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    if (!existingMenu) {
      await AsyncStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(initialMenuItems));
    }

    // Masaları kontrol et ve yükle
    const existingTables = await AsyncStorage.getItem(STORAGE_KEYS.TABLES);
    if (!existingTables) {
      await AsyncStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(initialTables));
    }

    // Garsonları kontrol et ve yükle (admin dahil)
    const existingWaiters = await AsyncStorage.getItem(STORAGE_KEYS.WAITERS);
    if (!existingWaiters) {
      const allUsers = [...initialWaiters, adminUser];
      await AsyncStorage.setItem(STORAGE_KEYS.WAITERS, JSON.stringify(allUsers));
    }

    // Siparişleri kontrol et
    const existingOrders = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!existingOrders) {
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }

    console.log('Veriler başarıyla yüklendi');
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
  }
};

// Kullanıcı doğrulama
export const authenticateUser = async (username, password) => {
  try {
    const waitersData = await AsyncStorage.getItem(STORAGE_KEYS.WAITERS);
    const waiters = waitersData ? JSON.parse(waitersData) : [];
    
    const user = waiters.find(w => w.username === username && w.password === password);
    
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, message: 'Kullanıcı adı veya şifre hatalı' };
  } catch (error) {
    console.error('Giriş hatası:', error);
    return { success: false, message: 'Giriş sırasında hata oluştu' };
  }
};

// Mevcut kullanıcıyı al
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    return null;
  }
};

// Çıkış yap
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return true;
  } catch (error) {
    console.error('Çıkış hatası:', error);
    return false;
  }
};

// Menü öğelerini al
export const getMenuItems = async () => {
  try {
    const menuData = await AsyncStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return menuData ? JSON.parse(menuData) : [];
  } catch (error) {
    console.error('Menü alma hatası:', error);
    return [];
  }
};

// Menü öğesi ekle/güncelle
export const saveMenuItem = async (menuItem) => {
  try {
    const menuData = await AsyncStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    let menuItems = menuData ? JSON.parse(menuData) : [];
    
    const existingIndex = menuItems.findIndex(item => item.id === menuItem.id);
    
    if (existingIndex >= 0) {
      menuItems[existingIndex] = menuItem;
    } else {
      menuItem.id = Date.now().toString();
      menuItems.push(menuItem);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
    return { success: true };
  } catch (error) {
    console.error('Menü kaydetme hatası:', error);
    return { success: false, message: 'Menü kaydedilemedi' };
  }
};

// Menü öğesi sil
export const deleteMenuItem = async (itemId) => {
  try {
    const menuData = await AsyncStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    let menuItems = menuData ? JSON.parse(menuData) : [];
    
    menuItems = menuItems.filter(item => item.id !== itemId);
    
    await AsyncStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
    return { success: true };
  } catch (error) {
    console.error('Menü silme hatası:', error);
    return { success: false, message: 'Menü silinemedi' };
  }
};

// Masaları al
export const getTables = async () => {
  try {
    const tablesData = await AsyncStorage.getItem(STORAGE_KEYS.TABLES);
    return tablesData ? JSON.parse(tablesData) : [];
  } catch (error) {
    console.error('Masa alma hatası:', error);
    return [];
  }
};

// Garsonları al
export const getWaiters = async () => {
  try {
    const waitersData = await AsyncStorage.getItem(STORAGE_KEYS.WAITERS);
    const waiters = waitersData ? JSON.parse(waitersData) : [];
    return waiters.filter(w => w.role === 'waiter'); // Sadece garsonları döndür
  } catch (error) {
    console.error('Garson alma hatası:', error);
    return [];
  }
};

// Garson ekle/güncelle
export const saveWaiter = async (waiter) => {
  try {
    const waitersData = await AsyncStorage.getItem(STORAGE_KEYS.WAITERS);
    let waiters = waitersData ? JSON.parse(waitersData) : [];
    
    const existingIndex = waiters.findIndex(w => w.id === waiter.id);
    
    if (existingIndex >= 0) {
      waiters[existingIndex] = waiter;
    } else {
      waiter.id = Date.now().toString();
      waiter.role = 'waiter';
      waiters.push(waiter);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.WAITERS, JSON.stringify(waiters));
    return { success: true };
  } catch (error) {
    console.error('Garson kaydetme hatası:', error);
    return { success: false, message: 'Garson kaydedilemedi' };
  }
};

// Garson sil
export const deleteWaiter = async (waiterId) => {
  try {
    const waitersData = await AsyncStorage.getItem(STORAGE_KEYS.WAITERS);
    let waiters = waitersData ? JSON.parse(waitersData) : [];
    
    waiters = waiters.filter(w => w.id !== waiterId);
    
    await AsyncStorage.setItem(STORAGE_KEYS.WAITERS, JSON.stringify(waiters));
    return { success: true };
  } catch (error) {
    console.error('Garson silme hatası:', error);
    return { success: false, message: 'Garson silinemedi' };
  }
};

// Siparişleri al
export const getOrders = async () => {
  try {
    const ordersData = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    return ordersData ? JSON.parse(ordersData) : [];
  } catch (error) {
    console.error('Sipariş alma hatası:', error);
    return [];
  }
};

// Sipariş ekle
export const addOrder = async (order) => {
  try {
    const ordersData = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    let orders = ordersData ? JSON.parse(ordersData) : [];
    
    order.id = Date.now().toString();
    order.createdAt = new Date().toISOString();
    order.status = 'pending'; // pending, preparing, ready, completed
    
    orders.push(order);
    
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return { success: true, order };
  } catch (error) {
    console.error('Sipariş ekleme hatası:', error);
    return { success: false, message: 'Sipariş eklenemedi' };
  }
};

// Sipariş durumu güncelle
export const updateOrderStatus = async (orderId, status) => {
  try {
    const ordersData = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    let orders = ordersData ? JSON.parse(ordersData) : [];
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex >= 0) {
      orders[orderIndex].status = status;
      if (status === 'completed') {
        orders[orderIndex].completedAt = new Date().toISOString();
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return { success: true };
    }
    
    return { success: false, message: 'Sipariş bulunamadı' };
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    return { success: false, message: 'Sipariş güncellenemedi' };
  }
}; 