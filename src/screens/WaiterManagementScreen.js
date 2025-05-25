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
  Modal,
  TextInput
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getWaiters, saveWaiter, deleteWaiter } from '../services/dataService';
import { useFocusEffect } from '@react-navigation/native';

const WaiterManagementScreen = ({ navigation }) => {
  const { state, setWaiters } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });

  const loadWaiters = async () => {
    try {
      const waiters = await getWaiters();
      setWaiters(waiters);
    } catch (error) {
      console.error('Error loading waiters:', error);
      Alert.alert('Hata', 'Garsonlar yüklenirken hata oluştu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWaiters();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadWaiters();
    }, [])
  );

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: ''
    });
  };

  const handleAddWaiter = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditWaiter = (waiter) => {
    setEditingWaiter(waiter);
    setFormData({
      name: waiter.name,
      username: waiter.username,
      password: waiter.password
    });
    setShowEditModal(true);
  };

  const handleDeleteWaiter = (waiter) => {
    Alert.alert(
      'Silme Onayı',
      `"${waiter.name}" garsonunu silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteWaiter(waiter.id);
              if (result.success) {
                await loadWaiters();
                Alert.alert('Başarılı', 'Garson silindi');
              } else {
                Alert.alert('Hata', result.message);
              }
            } catch (error) {
              console.error('Error deleting waiter:', error);
              Alert.alert('Hata', 'Silme işlemi sırasında hata oluştu');
            }
          }
        }
      ]
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Garson adı gereklidir');
      return false;
    }
    
    if (!formData.username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı gereklidir');
      return false;
    }
    
    if (formData.username.trim().length < 3) {
      Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalıdır');
      return false;
    }
    
    if (!formData.password.trim()) {
      Alert.alert('Hata', 'Şifre gereklidir');
      return false;
    }
    
    if (formData.password.trim().length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return false;
    }

    // Check for duplicate username (only for new waiters or when username is changed)
    const existingWaiter = state.waiters.find(w => 
      w.username.toLowerCase() === formData.username.trim().toLowerCase() &&
      (!editingWaiter || w.id !== editingWaiter.id)
    );
    
    if (existingWaiter) {
      Alert.alert('Hata', 'Bu kullanıcı adı zaten kullanılıyor');
      return false;
    }

    return true;
  };

  const handleSaveWaiter = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const waiterData = {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password.trim(),
        role: 'waiter'
      };

      if (editingWaiter) {
        waiterData.id = editingWaiter.id;
      }

      const result = await saveWaiter(waiterData);
      
      if (result.success) {
        await loadWaiters();
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingWaiter(null);
        resetForm();
        Alert.alert('Başarılı', editingWaiter ? 'Garson güncellendi' : 'Garson eklendi');
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Error saving waiter:', error);
      Alert.alert('Hata', 'Kaydetme işlemi sırasında hata oluştu');
    }
  };

  const renderWaiterItem = ({ item }) => (
    <View style={styles.waiterItem}>
      <View style={styles.waiterInfo}>
        <View style={styles.waiterHeader}>
          <Text style={styles.waiterName}>{item.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Aktif</Text>
          </View>
        </View>
        <Text style={styles.waiterUsername}>@{item.username}</Text>
        <Text style={styles.waiterRole}>Garson</Text>
      </View>
      <View style={styles.waiterActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditWaiter(item)}
        >
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteWaiter(item)}
        >
          <Text style={styles.actionButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFormModal = (visible, onClose, title) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Garson Adı *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Garson adını girin"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kullanıcı Adı *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
              placeholder="Kullanıcı adını girin (min. 3 karakter)"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helpText}>Giriş yaparken kullanılacak</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Şifre *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              placeholder="Şifre girin (min. 6 karakter)"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helpText}>Güvenli bir şifre seçin</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Bilgi</Text>
            <Text style={styles.infoText}>
              • Kullanıcı adı benzersiz olmalıdır{'\n'}
              • Şifre en az 6 karakter olmalıdır{'\n'}
              • Garson bu bilgilerle giriş yapabilecek
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={handleSaveWaiter}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
            <Text style={styles.title}>Garson Yönetimi</Text>
            <Text style={styles.subtitle}>{state.waiters.length} garson</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddWaiter}
          >
            <Text style={styles.addButtonText}>+ Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={state.waiters}
        renderItem={renderWaiterItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.waitersList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz garson bulunmuyor</Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={handleAddWaiter}>
              <Text style={styles.emptyAddButtonText}>İlk garsonunu ekle</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Modal */}
      {renderFormModal(showAddModal, () => setShowAddModal(false), 'Yeni Garson Ekle')}

      {/* Edit Modal */}
      {renderFormModal(showEditModal, () => {
        setShowEditModal(false);
        setEditingWaiter(null);
        resetForm();
      }, 'Garson Düzenle')}
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
  addButton: {
    backgroundColor: '#2980b9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  waitersList: {
    padding: 15,
  },
  waiterItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  waiterInfo: {
    marginBottom: 10,
  },
  waiterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  waiterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  waiterUsername: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 2,
  },
  waiterRole: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  waiterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
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
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  helpText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#34495e',
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WaiterManagementScreen; 