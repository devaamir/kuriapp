import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../store';
import { updateUser, clearUser } from '../store';
import { authService } from '../services/authService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, groups } = useSelector((state: RootState) => state.app);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    age: 0,
    upiId: '',
  });
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    drawResults: true,
    groupInvites: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  if (!user) return null;

  const activeGroups = groups.filter(
    g => g.status === 'active' && g.memberIds.includes(user?.id || ''),
  ).length;

  const totalContributions = groups.reduce((sum, group) => {
    const start = new Date(group.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const durationMonths = parseInt(
      group.duration.match(/(\d+)/)?.[1] || '0',
      10,
    );
    const currentMonth = Math.min(diffMonths, durationMonths);

    return sum + parseInt(group.monthlyAmount) * currentMonth;
  }, 0);

  const handleSave = () => {
    dispatch(updateUser(formData));
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
            dispatch(clearUser());
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header with gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>👤 Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account settings
          </Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.editAvatarButton}>
                  <Text style={styles.editAvatarIcon}>📷</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editIcon}>{isEditing ? '✕' : '✏️'}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{activeGroups}</Text>
            <Text style={styles.statLabel}>Active Groups</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              ₹{totalContributions.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Paid</Text>
          </Card>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              editable={isEditing}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              editable={isEditing}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={(formData.age || 0).toString()}
              onChangeText={text =>
                setFormData({ ...formData, age: parseInt(text) || 0 })
              }
              editable={isEditing}
              keyboardType="numeric"
            />
          </View>
        </Card>

        {/* Payment Information */}
        <Card style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Payment Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>UPI ID</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.upiId}
              onChangeText={text => setFormData({ ...formData, upiId: text })}
              editable={isEditing}
            />
          </View>

          <TouchableOpacity
            style={[styles.qrUploadButton, !isEditing && styles.disabledButton]}
            disabled={!isEditing}
          >
            <Text style={styles.qrIcon}>📱</Text>
            <Text style={styles.qrUploadText}>Upload QR Code</Text>
          </TouchableOpacity>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Notification Settings</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Payment Reminders</Text>
            <Switch
              value={notifications.paymentReminders}
              onValueChange={value =>
                setNotifications({ ...notifications, paymentReminders: value })
              }
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                notifications.paymentReminders ? Colors.primary : Colors.gray400
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Draw Results</Text>
            <Switch
              value={notifications.drawResults}
              onValueChange={value =>
                setNotifications({ ...notifications, drawResults: value })
              }
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                notifications.drawResults ? Colors.primary : Colors.gray400
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Group Invites</Text>
            <Switch
              value={notifications.groupInvites}
              onValueChange={value =>
                setNotifications({ ...notifications, groupInvites: value })
              }
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                notifications.groupInvites ? Colors.primary : Colors.gray400
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Marketing Emails</Text>
            <Switch
              value={notifications.marketingEmails}
              onValueChange={value =>
                setNotifications({ ...notifications, marketingEmails: value })
              }
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                notifications.marketingEmails ? Colors.primary : Colors.gray400
              }
            />
          </View>
        </Card>

        {/* Actions */}
        {isEditing ? (
          <View style={styles.editActions}>
            <Button
              title="Cancel"
              onPress={() => setIsEditing(false)}
              variant="outline"
              style={styles.actionButton}
              size="medium"
            />
            <Button
              title="Save Changes"
              onPress={handleSave}
              style={styles.actionButton}
              size="medium"
            />
          </View>
        ) : (
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={StyleSheet.flatten([
              styles.logoutButton,
              { borderColor: Colors.error },
            ])}
            size="medium"
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  headerContent: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: Colors.primaryLight,
  },
  profileCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '600',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarIcon: {
    fontSize: 12,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  editButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
  },
  editIcon: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    marginTop: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  infoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body1,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  disabledInput: {
    backgroundColor: Colors.gray50,
    color: Colors.textSecondary,
  },
  paymentCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  qrUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  disabledButton: {
    borderColor: Colors.gray300,
  },
  qrIcon: {
    fontSize: 20,
  },
  qrUploadText: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '500',
  },
  settingsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  settingLabel: {
    ...Typography.body1,
    color: Colors.textPrimary,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  logoutButton: {
    marginBottom: Spacing.xl,
  },
});
