import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Group, Notification, User, Analytics } from '../types';
import { mockGroups, mockNotifications, mockUser, mockAnalytics } from '../data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  user: User | null;
  groups: Group[];
  notifications: Notification[];
  analytics: Analytics;
  activeFilter: 'all' | 'active' | 'my_groups' | 'completed';
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  user: null,
  groups: [],
  notifications: [],
  analytics: mockAnalytics,
  activeFilter: 'all',
  isAuthenticated: false,
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.groups = [];
      state.notifications = [];
      AsyncStorage.removeItem('authToken');
    },
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    initializeAuth: (state) => {
      state.loading = false;
    },
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<{ id: string; updates: Partial<Group> }>) => {
      const index = state.groups.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = { ...state.groups[index], ...action.payload.updates };
      }
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(g => g.id !== action.payload);
    },
    setActiveFilter: (state, action: PayloadAction<AppState['activeFilter']>) => {
      state.activeFilter = action.payload;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setUser, 
  clearUser, 
  setAuthState,
  initializeAuth,
  setGroups, 
  addGroup, 
  updateGroup, 
  removeGroup, 
  setActiveFilter, 
  markNotificationAsRead, 
  deleteNotification, 
  updateUser 
} = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
