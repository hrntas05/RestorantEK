// Başlangıç verileri
export const initialMenuItems = [
  {
    id: '1',
    name: 'Adana Kebap',
    category: 'Ana Yemek',
    price: 85,
    description: 'Acılı kıyma kebabı, pilav, salata ile'
  },
  {
    id: '2',
    name: 'Tavuk Şiş',
    category: 'Ana Yemek',
    price: 75,
    description: 'Marine edilmiş tavuk göğsü, pilav ile'
  },
  {
    id: '3',
    name: 'Mercimek Çorbası',
    category: 'Çorba',
    price: 25,
    description: 'Geleneksel mercimek çorbası'
  },
  {
    id: '4',
    name: 'Çoban Salata',
    category: 'Salata',
    price: 35,
    description: 'Domates, salatalık, soğan, maydanoz'
  },
  {
    id: '5',
    name: 'Ayran',
    category: 'İçecek',
    price: 15,
    description: 'Ev yapımı ayran'
  },
  {
    id: '6',
    name: 'Çay',
    category: 'İçecek',
    price: 8,
    description: 'Demli çay'
  }
];

export const initialTables = [
  { id: '1', number: 1, capacity: 4, status: 'available', lastUpdated: new Date().toISOString(), currentOrder: null },
  { id: '2', number: 2, capacity: 2, status: 'occupied', lastUpdated: new Date().toISOString(), currentOrder: { id: 'demo1', waiterName: 'Ahmet Yılmaz', createdAt: new Date().toISOString() } },
  { id: '3', number: 3, capacity: 6, status: 'available', lastUpdated: new Date().toISOString(), currentOrder: null },
  { id: '4', number: 4, capacity: 4, status: 'reserved', lastUpdated: new Date().toISOString(), currentOrder: null },
  { id: '5', number: 5, capacity: 2, status: 'cleaning', lastUpdated: new Date().toISOString(), currentOrder: null },
  { id: '6', number: 6, capacity: 4, status: 'available', lastUpdated: new Date().toISOString(), currentOrder: null },
  { id: '7', number: 7, capacity: 8, status: 'available', lastUpdated: new Date().toISOString(), currentOrder: null },
  { id: '8', number: 8, capacity: 4, status: 'occupied', lastUpdated: new Date().toISOString(), currentOrder: { id: 'demo2', waiterName: 'Ahmet Yılmaz', createdAt: new Date().toISOString() } },
  { id: '9', number: 9, capacity: 2, status: 'available', lastUpdated: new Date().toISOString(), currentOrder: null },
  { id: '10', number: 10, capacity: 6, status: 'maintenance', lastUpdated: new Date().toISOString(), currentOrder: null }
];

export const initialWaiters = [
  {
    id: '1',
    username: 'garson1',
    password: '123456',
    name: 'Ahmet Yılmaz',
    role: 'waiter'
  }
];

export const adminUser = {
  id: 'admin',
  username: 'admin',
  password: 'admin',
  name: 'Yönetici',
  role: 'admin'
};

export const menuCategories = [
  'Çorba',
  'Ana Yemek', 
  'Salata',
  'İçecek',
  'Tatlı'
]; 