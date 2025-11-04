import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Switch, FAB, Avatar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { RootState } from '../store';
import { updateUser } from '../store';
import { Card } from 'react-native-paper';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.app);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    drawResults: true,
    groupInvites: true,
    marketingEmails: false,
  });

  const handleSave = () => {
    dispatch(updateUser(formData));
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => console.log('Logout'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E3F2FD', '#F8F9FA']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editIcon}>{isEditing ? '✕' : '✏️'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Picture */}
          <Animatable.View animation="fadeInDown" duration={600}>
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <TouchableOpacity style={styles.avatarContainer}>
                  <Avatar.Text
                    size={80}
                    label={user.name.split(' ').map(n => n[0]).join('')}
                    style={styles.avatar}
                  />
                  {isEditing && (
                    <View style={styles.editAvatarOverlay}>
                      <Text style={styles.cameraIcon}>📷</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </Card>
          </Animatable.View>

          {/* Personal Information */}
          <Animatable.View animation="fadeInUp" duration={600} delay={200}>
            <Card style={styles.infoCard}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              
              <TextInput
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                style={styles.input}
                mode="outlined"
                disabled={!isEditing}
              />

              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                style={styles.input}
                mode="outlined"
                disabled={!isEditing}
                keyboardType="email-address"
              />

              <TextInput
                label="Phone"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                style={styles.input}
                mode="outlined"
                disabled={!isEditing}
                keyboardType="phone-pad"
              />

              <TextInput
                label="Age"
                value={formData.age.toString()}
                onChangeText={(text) => setFormData({...formData, age: parseInt(text) || 0})}
                style={styles.input}
                mode="outlined"
                disabled={!isEditing}
                keyboardType="numeric"
              />
            </Card>
          </Animatable.View>

          {/* Payment Information */}
          <Animatable.View animation="fadeInUp" duration={600} delay={400}>
            <Card style={styles.paymentCard}>
              <Text style={styles.cardTitle}>Payment Information</Text>
              
              <TextInput
                label="UPI ID"
                value={formData.upiId}
                onChangeText={(text) => setFormData({...formData, upiId: text})}
                style={styles.input}
                mode="outlined"
                disabled={!isEditing}
              />

              <TouchableOpacity style={styles.qrUploadButton} disabled={!isEditing}>
                <Text style={styles.qrIcon}>📱</Text>
                <Text style={styles.qrUploadText}>Upload QR Code</Text>
              </TouchableOpacity>
            </Card>
          </Animatable.View>

          {/* Notification Settings */}
          <Animatable.View animation="fadeInUp" duration={600} delay={600}>
            <Card style={styles.settingsCard}>
              <Text style={styles.cardTitle}>Notification Settings</Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Payment Reminders</Text>
                <Switch
                  value={notifications.paymentReminders}
                  onValueChange={(value) => setNotifications({...notifications, paymentReminders: value})}
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Draw Results</Text>
                <Switch
                  value={notifications.drawResults}
                  onValueChange={(value) => setNotifications({...notifications, drawResults: value})}
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Group Invites</Text>
                <Switch
                  value={notifications.groupInvites}
                  onValueChange={(value) => setNotifications({...notifications, groupInvites: value})}
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Marketing Emails</Text>
                <Switch
                  value={notifications.marketingEmails}
                  onValueChange={(value) => setNotifications({...notifications, marketingEmails: value})}
                />
              </View>
            </Card>
          </Animatable.View>

          {/* Actions */}
          <Animatable.View animation="fadeInUp" duration={600} delay={800}>
            {isEditing ? (
              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditing(false)}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.actionButton}
                >
                  Save Changes
                </Button>
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={handleLogout}
                style={styles.logoutButton}
                textColor="#FF5722"
              >
                Logout
              </Button>
            )}
          </Animatable.View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* FAB */}
        <FAB
          icon={() => <Text style={styles.fabIcon}>➕</Text>}
          style={styles.fab}
          onPress={() => navigation.navigate('CreateKuri')}
        />
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
  editButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  editIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileCard: {
    marginBottom: 24,
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  infoCard: {
    marginBottom: 24,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  paymentCard: {
    marginBottom: 24,
    padding: 20,
  },
  qrUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 16,
    gap: 12,
  },
  qrIcon: {
    fontSize: 24,
  },
  qrUploadText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  settingsCard: {
    marginBottom: 24,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  editActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  logoutButton: {
    marginBottom: 24,
    borderColor: '#FF5722',
  },
  bottomSpacing: {
    height: 120,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  fabIcon: {
    fontSize: 20,
    color: 'white',
  },
});
