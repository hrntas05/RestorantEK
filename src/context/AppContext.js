import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initializeData, getCurrentUser } from '../services/dataService';

// Initial state
const initialState = {
  user: null,
  isLoading: true,
  menuItems: [],
  tables: [],
  waiters: [],
  orders: [],
  selectedTable: null,
  cart: []
};

// Action types
export const ACTION_TYPES = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_MENU_ITEMS: 'SET_MENU_ITEMS',
  SET_TABLES: 'SET_TABLES',
  SET_WAITERS: 'SET_WAITERS',
  SET_ORDERS: 'SET_ORDERS',
  SET_SELECTED_TABLE: 'SET_SELECTED_TABLE',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  LOGOUT: 'LOGOUT'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return { ...state, user: action.payload };
    
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ACTION_TYPES.SET_MENU_ITEMS:
      return { ...state, menuItems: action.payload };
    
    case ACTION_TYPES.SET_TABLES:
      return { ...state, tables: action.payload };
    
    case ACTION_TYPES.SET_WAITERS:
      return { ...state, waiters: action.payload };
    
    case ACTION_TYPES.SET_ORDERS:
      return { ...state, orders: action.payload };
    
    case ACTION_TYPES.SET_SELECTED_TABLE:
      return { ...state, selectedTable: action.payload };
    
    case ACTION_TYPES.ADD_TO_CART:
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...state,
          cart: [...state.cart, { ...action.payload, quantity: 1 }]
        };
      }
    
    case ACTION_TYPES.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    
    case ACTION_TYPES.UPDATE_CART_ITEM:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
    
    case ACTION_TYPES.CLEAR_CART:
      return { ...state, cart: [] };
    
    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        selectedTable: null,
        cart: []
      };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app data
  useEffect(() => {
    const initApp = async () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        
        // Initialize data
        await initializeData();
        
        // Check for existing user session
        const currentUser = await getCurrentUser();
        if (currentUser) {
          dispatch({ type: ACTION_TYPES.SET_USER, payload: currentUser });
        }
        
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    };

    initApp();
  }, []);

  // Context value
  const value = {
    state,
    dispatch,
    // Helper functions
    setUser: (user) => dispatch({ type: ACTION_TYPES.SET_USER, payload: user }),
    setLoading: (loading) => dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),
    setMenuItems: (items) => dispatch({ type: ACTION_TYPES.SET_MENU_ITEMS, payload: items }),
    setTables: (tables) => dispatch({ type: ACTION_TYPES.SET_TABLES, payload: tables }),
    setWaiters: (waiters) => dispatch({ type: ACTION_TYPES.SET_WAITERS, payload: waiters }),
    setOrders: (orders) => dispatch({ type: ACTION_TYPES.SET_ORDERS, payload: orders }),
    setSelectedTable: (table) => dispatch({ type: ACTION_TYPES.SET_SELECTED_TABLE, payload: table }),
    addToCart: (item) => dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: item }),
    removeFromCart: (itemId) => dispatch({ type: ACTION_TYPES.REMOVE_FROM_CART, payload: itemId }),
    updateCartItem: (item) => dispatch({ type: ACTION_TYPES.UPDATE_CART_ITEM, payload: item }),
    clearCart: () => dispatch({ type: ACTION_TYPES.CLEAR_CART }),
    logout: () => dispatch({ type: ACTION_TYPES.LOGOUT })
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 