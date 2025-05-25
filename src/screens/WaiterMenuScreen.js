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
  TextInput,
  Modal
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getMenuItems, addOrder } from '../services/dataService';
import { useFocusEffect } from '@react-navigation/native';

const WaiterMenuScreen = ({ navigation }) => {
  const { 
    state, 
    setMenuItems, 
    addToCart, 
    removeFromCart, 
    updateCartItem, 
    clearCart 
  } = useApp();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [orderNotes, setOrderNotes] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);

  const categories = ['Tümü', 'Çorba', 'Ana Yemek', 'Salata', 'İçecek', 'Tatlı'];

  const loadMenuItems = async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      Alert.alert('Hata', 'Menü yüklenirken hata oluştu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMenuItems();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadMenuItems();
    }, [])
  );

  const getFilteredMenuItems = () => {
    if (selectedCategory === 'Tümü') {
      return state.menuItems;
    }
    return state.menuItems.filter(item => item.category === selectedCategory);
  };

  const getTotalAmount = () => {
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    Alert.alert('Başarılı', `${item.name} sepete eklendi`);
  };

  const handleSubmitOrder = async () => {
    if (state.cart.length === 0) {
      Alert.alert('Hata', 'Sepet boş');
      return;
    }

    if (!state.selectedTable) {
      Alert.alert('Hata', 'Masa seçilmedi');
      return;
    }

    try {
      const order = {
        tableNumber: state.selectedTable.number,
        waiterName: state.user.name,
        waiterId: state.user.id,
        items: state.cart,
        totalAmount: getTotalAmount(),
        notes: orderNotes.trim()
      };

      const result = await addOrder(order);
      
      if (result.success) {
        clearCart();
        setOrderNotes('');
        setShowCartModal(false);
        
        Alert.alert(
          'Başarılı',
          'Sipariş başarıyla gönderildi',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      Alert.alert('Hata', 'Sipariş gönderilirken hata oluştu');
    }
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>{item.price} ₺</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>{item.price} ₺</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateCartItem({ id: item.id, quantity: item.quantity - 1 })}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateCartItem({ id: item.id, quantity: item.quantity + 1 })}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredItems = getFilteredMenuItems();

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
            <Text style={styles.title}>Menü</Text>
            <Text style={styles.subtitle}>Masa {state.selectedTable?.number}</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setShowCartModal(true)}
          >
            <Text style={styles.cartButtonText}>
              Sepet ({getTotalItems()})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.activeCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.menuList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bu kategoride ürün bulunmuyor</Text>
          </View>
        }
      />

      {/* Cart Modal */}
      <Modal
        visible={showCartModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sepet</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCartModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {state.cart.length > 0 ? (
            <>
              <FlatList
                data={state.cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                style={styles.cartList}
              />

              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Sipariş Notu (Opsiyonel):</Text>
                <TextInput
                  style={styles.notesInput}
                  value={orderNotes}
                  onChangeText={setOrderNotes}
                  placeholder="Özel isteklerinizi yazın..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.orderSummary}>
                <Text style={styles.totalText}>
                  Toplam: {getTotalAmount()} ₺
                </Text>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitOrder}
                >
                  <Text style={styles.submitButtonText}>Siparişi Gönder</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>Sepet boş</Text>
            </View>
          )}
        </View>
      </Modal>
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
  cartButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeCategoryButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  categoryText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
  },
  menuList: {
    padding: 15,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: '#3498db',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    flex: 1,
    padding: 15,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#27ae60',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#3498db',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 15,
  },
  notesContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#2c3e50',
    textAlignVertical: 'top',
  },
  orderSummary: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default WaiterMenuScreen; 