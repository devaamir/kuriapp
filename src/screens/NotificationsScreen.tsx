import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { RootState } from '../store';
import { markNotificationAsRead, deleteNotification } from '../store';
import { Card } from 'react-native-paper';
import { Notification } from '../types';

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.app);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
  ];

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (activeTab === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_due': return '💳';
      case 'payment_paid': return '✅';
      case 'spin_reminder': return '🎰';
      case 'draw_result': return '🏆';
      case 'group_invite': return '👥';
      case 'agreement_pending': return '📄';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment_due': return '#FF5722';
      case 'payment_paid': return '#4CAF50';
      case 'spin_reminder': return '#FF9800';
      case 'draw_result': return '#FFD700';
      case 'group_invite': return '#2196F3';
      case 'agreement_pending': return '#9C27B0';
      default: return '#666';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id));
    }

    // Navigate to related screen based on notification type
    if (notification.groupId) {
      navigation.navigate('GroupDetails', { groupId: notification.groupId });
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteNotification(notificationId)),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E3F2FD', '#F8F9FA']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
              {tab.key === 'unread' && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {notifications.filter(n => !n.isRead).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredNotifications.length === 0 ? (
            <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'unread' ? 'All caught up!' : 'You have no notifications yet'}
              </Text>
            </Animatable.View>
          ) : (
            filteredNotifications.map((notification, index) => {
              const cardStyle = notification.isRead 
                ? styles.notificationCard 
                : StyleSheet.flatten([styles.notificationCard, styles.unreadCard]);
              
              return (
              <Animatable.View
                key={notification.id}
                animation="fadeInUp"
                delay={index * 100}
              >
                <TouchableOpacity
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.8}
                >
                  <Card style={cardStyle}>
                    <View style={styles.notificationContent}>
                      <View style={[
                        styles.iconContainer,
                        { backgroundColor: getNotificationColor(notification.type) + '20' }
                      ]}>
                        <Text style={styles.notificationEmoji}>
                          {getNotificationIcon(notification.type)}
                        </Text>
                      </View>

                      <View style={styles.textContainer}>
                        <View style={styles.titleRow}>
                          <Text style={styles.notificationTitle}>{notification.title}</Text>
                          {!notification.isRead && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                        <Text style={styles.notificationDate}>{formatDate(notification.date)}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteNotification(notification.id)}
                      >
                        <Text style={styles.deleteIcon}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animatable.View>
              );
            })
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  markAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    gap: 12,
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  unreadBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: 16,
    padding: 16,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationEmoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 12,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 12,
    marginLeft: 12,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#999',
  },
});
