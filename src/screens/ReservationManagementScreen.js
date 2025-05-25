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
import { getReservations, saveReservation, deleteReservation, getTables } from '../services/dataService';
import { useFocusEffect } from '@react-navigation/native';

const ReservationManagementScreen = ({ navigation }) => {
  const { state, setReservations, setTables } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    tableId: '',
    date: '',
    time: '',
    guestCount: '',
    notes: ''
  });

  const loadData = async () => {
    try {
      const [reservations, tables] = await Promise.all([
        getReservations(),
        getTables()
      ]);
      setReservations(reservations);
      setTables(tables);
      setAvailableTables(tables.filter(t => t.status === 'available' || t.status === 'reserved'));
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

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      tableId: '',
      date: '',
      time: '',
      guestCount: '',
      notes: ''
    });
  };

  const handleAddReservation = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setFormData({
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      tableId: reservation.tableId,
      date: reservation.date,
      time: reservation.time,
      guestCount: reservation.guestCount.toString(),
      notes: reservation.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteReservation = (reservation) => {
    Alert.alert(
      'Silme Onayı',
      `${reservation.customerName} adına yapılan rezervasyonu silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteReservation(reservation.id);
              if (result.success) {
                await loadData();
                Alert.alert('Başarılı', 'Rezervasyon silindi');
              } else {
                Alert.alert('Hata', result.message);
              }
            } catch (error) {
              console.error('Error deleting reservation:', error);
              Alert.alert('Hata', 'Silme işlemi sırasında hata oluştu');
            }
          }
        }
      ]
    );
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      Alert.alert('Hata', 'Müşteri adı gereklidir');
      return false;
    }
    
    if (!formData.customerPhone.trim()) {
      Alert.alert('Hata', 'Telefon numarası gereklidir');
      return false;
    }
    
    if (!formData.tableId) {
      Alert.alert('Hata', 'Masa seçimi gereklidir');
      return false;
    }
    
    if (!formData.date.trim()) {
      Alert.alert('Hata', 'Tarih gereklidir');
      return false;
    }
    
    if (!formData.time.trim()) {
      Alert.alert('Hata', 'Saat gereklidir');
      return false;
    }
    
    if (!formData.guestCount.trim() || isNaN(parseInt(formData.guestCount)) || parseInt(formData.guestCount) < 1) {
      Alert.alert('Hata', 'Geçerli bir kişi sayısı girin');
      return false;
    }

    // Check table capacity
    const selectedTable = availableTables.find(t => t.id === formData.tableId);
    if (selectedTable && parseInt(formData.guestCount) > selectedTable.capacity) {
      Alert.alert('Hata', `Seçilen masa maksimum ${selectedTable.capacity} kişiliktir`);
      return false;
    }

    return true;
  };

  const handleSaveReservation = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const reservationData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        tableId: formData.tableId,
        date: formData.date.trim(),
        time: formData.time.trim(),
        guestCount: parseInt(formData.guestCount),
        notes: formData.notes.trim(),
        status: 'confirmed'
      };

      if (editingReservation) {
        reservationData.id = editingReservation.id;
      }

      const result = await saveReservation(reservationData);
      
      if (result.success) {
        await loadData();
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingReservation(null);
        resetForm();
        Alert.alert('Başarılı', editingReservation ? 'Rezervasyon güncellendi' : 'Rezervasyon eklendi');
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      Alert.alert('Hata', 'Kaydetme işlemi sırasında hata oluştu');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#27ae60';
      case 'arrived':
        return '#3498db';
      case 'completed':
        return '#95a5a6';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#f39c12';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı';
      case 'arrived':
        return 'Geldi';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal';
      default:
        return 'Bekliyor';
    }
  };

  const getTableName = (tableId) => {
    const table = state.tables.find(t => t.id === tableId);
    return table ? `Masa ${table.number}` : 'Bilinmiyor';
  };

  const renderReservationItem = ({ item }) => (
    <View style={styles.reservationItem}>
      <View style={styles.reservationHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.customerPhone}>{item.customerPhone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.reservationDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Masa:</Text>
          <Text style={styles.detailValue}>{getTableName(item.tableId)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tarih:</Text>
          <Text style={styles.detailValue}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Saat:</Text>
          <Text style={styles.detailValue}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Kişi Sayısı:</Text>
          <Text style={styles.detailValue}>{item.guestCount} kişi</Text>
        </View>
        {item.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Not:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.reservationActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditReservation(item)}
        >
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteReservation(item)}
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
            <Text style={styles.inputLabel}>Müşteri Adı *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.customerName}
              onChangeText={(text) => setFormData({...formData, customerName: text})}
              placeholder="Müşteri adını girin"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon Numarası *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.customerPhone}
              onChangeText={(text) => setFormData({...formData, customerPhone: text})}
              placeholder="0555 123 45 67"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Masa Seçimi *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tableSelector}>
                {availableTables.map((table) => (
                  <TouchableOpacity
                    key={table.id}
                    style={[
                      styles.tableOption,
                      formData.tableId === table.id && styles.selectedTableOption
                    ]}
                    onPress={() => setFormData({...formData, tableId: table.id})}
                  >
                    <Text style={[
                      styles.tableOptionText,
                      formData.tableId === table.id && styles.selectedTableOptionText
                    ]}>
                      Masa {table.number} ({table.capacity} kişi)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tarih *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.date}
              onChangeText={(text) => setFormData({...formData, date: text})}
              placeholder="GG.AA.YYYY (örn: 25.12.2024)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Saat *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.time}
              onChangeText={(text) => setFormData({...formData, time: text})}
              placeholder="SS:DD (örn: 19:30)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kişi Sayısı *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.guestCount}
              onChangeText={(text) => setFormData({...formData, guestCount: text})}
              placeholder="Kaç kişi?"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notlar</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({...formData, notes: text})}
              placeholder="Özel istekler, alerjiler vb."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
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
            onPress={handleSaveReservation}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const todayReservations = state.reservations?.filter(r => {
    const today = new Date().toLocaleDateString('tr-TR');
    return r.date === today;
  }) || [];

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
            <Text style={styles.title}>Rezervasyon Yönetimi</Text>
            <Text style={styles.subtitle}>{state.reservations?.length || 0} rezervasyon</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddReservation}
          >
            <Text style={styles.addButtonText}>+ Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayReservations.length}</Text>
          <Text style={styles.statLabel}>Bugün</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {state.reservations?.filter(r => r.status === 'confirmed').length || 0}
          </Text>
          <Text style={styles.statLabel}>Onaylı</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {state.reservations?.filter(r => r.status === 'arrived').length || 0}
          </Text>
          <Text style={styles.statLabel}>Geldi</Text>
        </View>
      </View>

      <FlatList
        data={state.reservations || []}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.reservationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz rezervasyon bulunmuyor</Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={handleAddReservation}>
              <Text style={styles.emptyAddButtonText}>İlk rezervasyonu ekle</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Modal */}
      {renderFormModal(showAddModal, () => setShowAddModal(false), 'Yeni Rezervasyon')}

      {/* Edit Modal */}
      {renderFormModal(showEditModal, () => {
        setShowEditModal(false);
        setEditingReservation(null);
        resetForm();
      }, 'Rezervasyon Düzenle')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#e67e22',
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
    backgroundColor: '#d35400',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  reservationsList: {
    padding: 15,
  },
  reservationItem: {
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
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  reservationDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 5,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  notesLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 11,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  reservationActions: {
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
    backgroundColor: '#3498db',
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
    backgroundColor: '#e67e22',
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
    backgroundColor: '#e67e22',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tableSelector: {
    flexDirection: 'row',
  },
  tableOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTableOption: {
    backgroundColor: '#e67e22',
    borderColor: '#e67e22',
  },
  tableOptionText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  selectedTableOptionText: {
    color: '#fff',
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
    backgroundColor: '#e67e22',
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

export default ReservationManagementScreen; 