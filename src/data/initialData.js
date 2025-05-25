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

// Örnek siparişler (test için)
export const initialOrders = [
  {
    id: '1',
    tableNumber: 2,
    waiterName: 'Ahmet Yılmaz',
    items: [
      { id: '1', name: 'Adana Kebap', price: 85, quantity: 2 },
      { id: '3', name: 'Mercimek Çorbası', price: 25, quantity: 2 },
      { id: '5', name: 'Ayran', price: 15, quantity: 2 }
    ],
    notes: 'Az acılı olsun',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
    completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    tableNumber: 8,
    waiterName: 'Ahmet Yılmaz',
    items: [
      { id: '2', name: 'Tavuk Şiş', price: 75, quantity: 1 },
      { id: '4', name: 'Çoban Salata', price: 35, quantity: 1 },
      { id: '6', name: 'Çay', price: 8, quantity: 2 }
    ],
    notes: '',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 saat önce
    completedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    tableNumber: 1,
    waiterName: 'Ahmet Yılmaz',
    items: [
      { id: '1', name: 'Adana Kebap', price: 85, quantity: 1 },
      { id: '2', name: 'Tavuk Şiş', price: 75, quantity: 1 },
      { id: '3', name: 'Mercimek Çorbası', price: 25, quantity: 2 },
      { id: '5', name: 'Ayran', price: 15, quantity: 3 }
    ],
    notes: 'Çabuk hazırlansın',
    status: 'completed',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 saat önce
    completedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    tableNumber: 3,
    waiterName: 'Ahmet Yılmaz',
    items: [
      { id: '4', name: 'Çoban Salata', price: 35, quantity: 2 },
      { id: '6', name: 'Çay', price: 8, quantity: 4 }
    ],
    notes: '',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 saat önce
    completedAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    tableNumber: 6,
    waiterName: 'Ahmet Yılmaz',
    items: [
      { id: '1', name: 'Adana Kebap', price: 85, quantity: 3 },
      { id: '3', name: 'Mercimek Çorbası', price: 25, quantity: 3 },
      { id: '4', name: 'Çoban Salata', price: 35, quantity: 1 },
      { id: '5', name: 'Ayran', price: 15, quantity: 3 }
    ],
    notes: 'Aile siparişi',
    status: 'completed',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 saat önce
    completedAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    tableNumber: 7,
    waiterName: 'Ahmet Yılmaz',
    items: [
      { id: '2', name: 'Tavuk Şiş', price: 75, quantity: 2 },
      { id: '6', name: 'Çay', price: 8, quantity: 2 }
    ],
    notes: '',
    status: 'preparing',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 dakika önce
  },
  {
    id: '7',
    tableNumber: 9,
    waiterName: 'Ahmet Yılmaz',
    items: [
      { id: '3', name: 'Mercimek Çorbası', price: 25, quantity: 1 },
      { id: '5', name: 'Ayran', price: 15, quantity: 1 }
    ],
    notes: '',
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 dakika önce
  }
]; 