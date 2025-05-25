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
  { id: '1', number: 1, status: 'available' },
  { id: '2', number: 2, status: 'available' },
  { id: '3', number: 3, status: 'available' },
  { id: '4', number: 4, status: 'available' },
  { id: '5', number: 5, status: 'available' },
  { id: '6', number: 6, status: 'available' },
  { id: '7', number: 7, status: 'available' },
  { id: '8', number: 8, status: 'available' },
  { id: '9', number: 9, status: 'available' },
  { id: '10', number: 10, status: 'available' }
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