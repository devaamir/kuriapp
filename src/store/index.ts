import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Group, Notification, User, Analytics } from '../types';
import { mockGroups, mockNotifications, mockUser, mockAnalytics } from '../data/mockData';

interface AppState {
  user: User;
  groups: Group[];
  notifications: Notification[];
  analytics: Analytics;
  activeFilter: 'all' | 'active' | 'my_groups' | 'completed';
}

const initialState: AppState = {
  user: mockUser,
  groups: mockGroups,
  notifications: mockNotifications,
  analytics: mockAnalytics,
  activeFilter: 'all',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
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
      state.user = { ...state.user, ...action.payload };
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.push(action.payload);
    },
  },
});

export const { setActiveFilter, markNotificationAsRead, deleteNotification, updateUser, addGroup } = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
