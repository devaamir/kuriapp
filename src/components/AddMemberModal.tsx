import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Button } from './Button';
import { userService } from '../services/userService';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  uniqueCode?: string;
}

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMember: (type: 'existing' | 'new', data: { userIds?: string[]; names?: string[] }) => Promise<void>;
  existingMemberIds: string[];
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  visible,
  onClose,
  onAddMember,
  existingMemberIds,
}) => {
  const [memberType, setMemberType] = useState<'existing' | 'new'>('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // New user fields
  const [newUserName, setNewUserName] = useState('');
  const [newUsersList, setNewUsersList] = useState<string[]>([]);

  useEffect(() => {
    if (visible && memberType === 'existing') {
      loadUsers();
    }
  }, [visible, memberType]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.uniqueCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const result = await userService.searchUsers('');
      let allUsers: User[] = [];
      
      if (Array.isArray(result)) {
        allUsers = result;
      } else if (result.data && Array.isArray(result.data)) {
        allUsers = result.data;
      }
      
      // Filter out users who are already members
      const availableUsers = allUsers.filter(user => !existingMemberIds.includes(user.id));
      
      setUsers(availableUsers);
      setFilteredUsers(availableUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async () => {
    if (memberType === 'existing' && selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user');
      return;
    }
    if (memberType === 'new' && newUsersList.length === 0) {
      Alert.alert('Error', 'Please add at least one member');
      return;
    }

    setLoading(true);
    try {
      if (memberType === 'existing') {
        await onAddMember('existing', { userIds: selectedUsers.map(u => u.id) });
      } else {
        await onAddMember('new', { names: newUsersList });
      }
      resetForm();
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedUsers([]);
    setNewUserName('');
    setNewUsersList([]);
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const addNewUser = () => {
    if (!newUserName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (newUsersList.includes(newUserName.trim())) {
      Alert.alert('Error', 'This name is already added');
      return;
    }
    setNewUsersList(prev => [...prev, newUserName.trim()]);
    setNewUserName('');
  };

  const removeNewUser = (name: string) => {
    setNewUsersList(prev => prev.filter(n => n !== name));
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some(u => u.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.userItem,
          isSelected && styles.userItemSelected,
        ]}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.uniqueCode && (
            <Text style={styles.userCode}>Code: {item.uniqueCode}</Text>
          )}
        </View>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Member</Text>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                memberType === 'existing' && styles.typeButtonActive,
              ]}
              onPress={() => setMemberType('existing')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  memberType === 'existing' && styles.typeButtonTextActive,
                ]}
              >
                Existing User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                memberType === 'new' && styles.typeButtonActive,
              ]}
              onPress={() => setMemberType('new')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  memberType === 'new' && styles.typeButtonTextActive,
                ]}
              >
                New User
              </Text>
            </TouchableOpacity>
          </View>

          {memberType === 'existing' ? (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email or code"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              
              {selectedUsers.length > 0 && (
                <View style={styles.selectedCount}>
                  <Text style={styles.selectedCountText}>
                    {selectedUsers.length} selected
                  </Text>
                </View>
              )}
              
              {loadingUsers ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredUsers}
                  renderItem={renderUserItem}
                  keyExtractor={item => item.id}
                  style={styles.userList}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No users found</Text>
                  }
                />
              )}
            </>
          ) : (
            <View>
              <View style={styles.newUserInputRow}>
                <TextInput
                  style={[styles.input, styles.newUserInput]}
                  placeholder="Enter name"
                  value={newUserName}
                  onChangeText={setNewUserName}
                  onSubmitEditing={addNewUser}
                />
                <TouchableOpacity style={styles.addButton} onPress={addNewUser}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              
              {newUsersList.length > 0 && (
                <View style={styles.newUsersList}>
                  {newUsersList.map((name, index) => (
                    <View key={index} style={styles.newUserChip}>
                      <Text style={styles.newUserChipText}>{name}</Text>
                      <TouchableOpacity onPress={() => removeNewUser(name)}>
                        <Text style={styles.removeChipText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={() => {
                resetForm();
                onClose();
              }}
              variant="outline"
              style={styles.actionButton}
              disabled={loading}
            />
            <Button
              title={loading ? 'Adding...' : `Add ${memberType === 'existing' ? selectedUsers.length : newUsersList.length} Member${(memberType === 'existing' ? selectedUsers.length : newUsersList.length) !== 1 ? 's' : ''}`}
              onPress={handleSubmit}
              style={styles.actionButton}
              disabled={loading || (memberType === 'existing' ? selectedUsers.length === 0 : newUsersList.length === 0)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  typeButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Typography.body2,
    fontSize: 14,
  },
  selectedCount: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  selectedCountText: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  userList: {
    maxHeight: 280,
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.gray50,
  },
  userItemSelected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  userInitial: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.body2,
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  userCode: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.primary,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.caption,
    color: Colors.text,
    marginBottom: 4,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    ...Typography.body2,
    color: Colors.text,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  newUserInputRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  newUserInput: {
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  newUsersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  newUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  newUserChipText: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 12,
  },
  removeChipText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
