import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Button, Switch, Chip, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';

import { addGroup, setLoading, setError } from '../store';
import { kuriService, CreateKuriRequest } from '../services/kuriService';
import { userService } from '../services/userService';
import { AddMemberModal } from '../components/AddMemberModal';
import { Group, Member } from '../types';
import { RootState } from '../store';
// Simple font definition for UI-only mode
const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semiBold: 'System',
};

interface CreateKuriScreenProps {
  navigation: any;
  route: any;
}

interface MemberItem {
  name: string;
  id?: string;
  type: 'existing' | 'dummy';
  uniqueCode?: string;
}

export const CreateKuriScreen: React.FC<CreateKuriScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.app);
  const { mode, kuriId, kuriData } = route.params || {};
  const isEditMode = mode === 'edit';

  const [isNewKuri, setIsNewKuri] = useState(true);
  const [loading, setLocalLoading] = useState(false);
  const [formData, setFormData] = useState({
    groupName: kuriData?.name || '',
    monthlyAmount: kuriData?.monthlyAmount || '',
    duration: kuriData?.duration?.replace(' Months', '') || '',
    startDate: kuriData?.startDate || '',
    description: kuriData?.description || '',
  });

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [existingFormData, setExistingFormData] = useState({
    groupName: '',
    monthlyAmount: '',
    duration: '',
    startDate: '',
    kuriTakenDate: '',
    description: '',
  });
  const [showExistingDatePicker, setShowExistingDatePicker] = useState(false);
  const [showKuriTakenDatePicker, setShowKuriTakenDatePicker] = useState(false);
  const [existingMembers, setExistingMembers] = useState<MemberItem[]>([]);
  const [showExistingAddMemberModal, setShowExistingAddMemberModal] = useState(false);

  const onExistingDateChange = (event: any, selectedDate?: Date) => {
    setShowExistingDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setExistingFormData({ ...existingFormData, startDate: formattedDate });
    }
  };

  const handleSubmitExisting = async () => {
    if (
      !existingFormData.groupName ||
      !existingFormData.monthlyAmount ||
      !existingFormData.duration
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLocalLoading(true);
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const existingMemberIds = existingMembers
        .filter(m => m.type === 'existing' && m.id)
        .map(m => m.id!);

      const kuriPayload: CreateKuriRequest = {
        name: existingFormData.groupName,
        monthlyAmount: parseInt(existingFormData.monthlyAmount),
        description: existingFormData.description ||
          'Monthly contribution as agreed. Draw conducted on the specified date each month.',
        duration: `${existingFormData.duration} Months`,
        startDate: existingFormData.startDate || new Date().toISOString().split('T')[0],
        kuriTakenDate: existingFormData.kuriTakenDate || undefined,
        memberIds: existingMemberIds.length > 0 ? existingMemberIds : undefined,
        status: 'active',
        type: 'existing',
      };

      const response = await kuriService.createKuri(kuriPayload);

      if (response.status === 201) {
        const newKuriId = response.data?.id;

        // Add dummy (offline) members separately
        const dummyMembers = existingMembers.filter(m => m.type === 'dummy');
        for (const member of dummyMembers) {
          try {
            await kuriService.addMember(newKuriId, { type: 'dummy', name: member.name });
          } catch (err) {
            console.error(`Failed to add dummy member ${member.name}`, err);
          }
        }

        const newGroup: Group = {
          adminId: response.data.adminId,
          createdBy: response.data.adminId,
          description: kuriPayload.description!,
          duration: kuriPayload.duration!,
          id: newKuriId,
          memberIds: [response.data.adminId, ...existingMemberIds],
          monthlyAmount: existingFormData.monthlyAmount,
          name: existingFormData.groupName,
          startDate: kuriPayload.startDate!,
          status: 'active',
          type: 'monthly',
        };
        dispatch(addGroup(newGroup));

        Alert.alert(
          '✅ Kuri Recorded!',
          `"${existingFormData.groupName}" has been added to your account.\n\n` +
          `💰 Monthly Amount: ₹${existingFormData.monthlyAmount}\n` +
          `📅 Duration: ${existingFormData.duration} Months`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Failed to record existing kuri';
      dispatch(setError(msg));
      Alert.alert('Error', msg);
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, startDate: formattedDate });
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      setIsSearching(true);
      setShowResults(true);
      try {
        const response = await userService.searchUsers(text);
        if (response.length > 0) {
          // Filter out users already added
          const filtered = Array.isArray(response)
            ? response.filter((u: any) => !members.some(m => m.id === u.id))
            : [response].filter((u: any) => u && !members.some(m => m.id === u.id));

          setSearchResults(filtered);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectUser = (user: any) => {
    const newMemberItem: MemberItem = {
      name: user.name,
      id: user.id,
      type: 'existing',
      uniqueCode: user.uniqueCode
    };
    setMembers([...members, newMemberItem]);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const addDummyMember = () => {
    if (searchQuery.trim()) {
      const newMemberItem: MemberItem = {
        name: searchQuery.trim(),
        type: 'dummy'
      };
      setMembers([...members, newMemberItem]);
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const removeMember = (indexToRemove: number) => {
    setMembers(members.filter((_, index) => index !== indexToRemove));
  };

  const handleAddMembers = async (
    type: 'existing' | 'new',
    data: { userIds?: string[]; names?: string[] },
  ) => {
    try {
      if (type === 'existing' && data.userIds) {
        // Fetch user details for existing users
        const response = await userService.searchUsers('');
        const allUsers = Array.isArray(response) ? response : response.data || [];
        
        const newMembers: MemberItem[] = data.userIds.map(userId => {
          const user = allUsers.find((u: any) => u.id === userId);
          return {
            name: user?.name || 'Unknown',
            id: userId,
            type: 'existing',
            uniqueCode: user?.uniqueCode,
          };
        });
        
        setMembers([...members, ...newMembers]);
      } else if (type === 'new' && data.names) {
        const newMembers: MemberItem[] = data.names.map(name => ({
          name,
          type: 'dummy',
        }));
        
        setMembers([...members, ...newMembers]);
      }
    } catch (error) {
      console.error('Failed to add members:', error);
      throw error;
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!kuriId) return;

    try {
      setLocalLoading(true);
      const updatedMemberIds = kuriData.members
        .filter((m: any) => m.id !== memberId)
        .map((m: any) => m.id);

      await kuriService.updateMembers(kuriId, updatedMemberIds);

      Alert.alert('Success', 'Member removed successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove member');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.groupName || !formData.monthlyAmount || !formData.duration) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLocalLoading(true);
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const kuriPayload: any = {
        name: formData.groupName,
        monthlyAmount: parseInt(formData.monthlyAmount),
        description: formData.description,
        duration: `${formData.duration} Months`,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        type: 'new',
      };

      if (isEditMode && kuriId) {
        // Update existing Kuri
        await kuriService.updateKuri(kuriId, kuriPayload);

        Alert.alert('Success!', 'Kuri updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Collect memberIds of existing (registered) users to pass directly
        const existingMemberIds = members
          .filter(m => m.type === 'existing' && m.id)
          .map(m => m.id!);
        if (existingMemberIds.length > 0) {
          kuriPayload.memberIds = existingMemberIds;
        }

        const response = await kuriService.createKuri(kuriPayload);

        if (response.status === 201) {
          // Add dummy (offline) members via separate endpoint
          const dummyMembers = members.filter(m => m.type === 'dummy');
          for (const member of dummyMembers) {
            try {
              await kuriService.addMember(response.data.id, {
                type: 'dummy',
                name: member.name,
              });
            } catch (err) {
              console.error(`Failed to add dummy member ${member.name}`, err);
            }
          }

          const newGroup: Group = {
            adminId: response.data.adminId,
            createdBy: response.data.adminId,
            description: formData.description,
            duration: `${formData.duration} Months`,
            id: response.data.id,
            memberIds: [response.data.adminId, ...existingMemberIds],
            monthlyAmount: formData.monthlyAmount,
            name: formData.groupName,
            startDate: formData.startDate || new Date().toISOString().split('T')[0],
            status: response.data.status as 'active' | 'pending' | 'completed',
            type: 'monthly',
          };
          dispatch(addGroup(newGroup));

          Alert.alert(
            '🎉 Kuri Created!',
            `"${formData.groupName}" has been created successfully!\n\n` +
            `💰 Monthly Amount: ₹${formData.monthlyAmount}\n` +
            `📅 Duration: ${formData.duration} Months`,
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || `Failed to ${isEditMode ? 'update' : 'create'} kuri`;
      dispatch(setError(errorMessage));
      console.log(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>⬅️</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Kuri' : 'Create Kuri'}
          </Text>
        </View>

        {/* Tabs */}
        {!isEditMode && (
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, isNewKuri && styles.tabActive]}
              onPress={() => setIsNewKuri(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isNewKuri && styles.tabTextActive]}>
                New Kuri
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isNewKuri && styles.tabActive]}
              onPress={() => setIsNewKuri(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, !isNewKuri && styles.tabTextActive]}>
                Existing Kuri
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* New Kuri Form */}
          {(isNewKuri || isEditMode) && (
          <>
            <View>
            <Card style={styles.formCard}>
              <Text style={styles.cardTitle}>Group Details</Text>

              <TextInput
                label="Group Name *"
                value={formData.groupName}
                onChangeText={text =>
                  setFormData({ ...formData, groupName: text })
                }
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Monthly Amount (₹) *"
                value={formData.monthlyAmount}
                onChangeText={text =>
                  setFormData({ ...formData, monthlyAmount: text })
                }
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />

              <Text style={styles.sectionTitle}>Duration (Months) *</Text>
              <TextInput
                mode="outlined"
                value={formData.duration}
                onChangeText={text =>
                  setFormData({ ...formData, duration: text })
                }
                keyboardType="numeric"
                placeholder="Enter duration in months"
                style={styles.input}
              />

              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    label="Start Date"
                    value={formData.startDate}
                    style={styles.input}
                    mode="outlined"
                    placeholder="YYYY-MM-DD"
                    editable={false}
                    right={<TextInput.Icon icon="calendar" />}
                  />
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.startDate ? new Date(formData.startDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              <TextInput
                label="Description (Optional)"
                value={formData.description}
                onChangeText={text =>
                  setFormData({ ...formData, description: text })
                }
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
              />


            </Card>
            </View>

            {/* Members */}
            <View>
            <Card style={styles.membersCard}>
              <Text style={styles.cardTitle}>
                {isEditMode ? 'Members' : 'Add Members'}
              </Text>

              {isEditMode && kuriData?.members && (
                <View style={styles.existingMembersContainer}>
                  <Text style={styles.sectionSubtitle}>Current Members:</Text>
                  {kuriData.members.map((member: any) => (
                    <View key={member.id} style={styles.existingMemberItem}>
                      <View>
                        <Text style={styles.existingMemberName}>{member.name}</Text>
                        <Text style={styles.existingMemberCode}>{member.uniqueCode}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            'Remove Member',
                            `Remove ${member.name} from this Kuri?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Remove',
                                style: 'destructive',
                                onPress: () => handleRemoveMember(member.id),
                              },
                            ]
                          );
                        }}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {isEditMode && kuriData?.winners && kuriData.winners.length > 0 && (
                <View style={styles.existingWinnersContainer}>
                  <Text style={styles.sectionSubtitle}>Winners:</Text>
                  {kuriData.winners.map((winner: any, index: number) => {
                    const member = kuriData.members?.find((m: any) => m.id === winner.memberId);
                    return (
                      <View key={`winner-${winner.memberId}-${winner.month}-${index}`} style={styles.existingWinnerItem}>
                        <Text style={styles.existingWinnerName}>
                          {member?.name || 'Unknown'}
                        </Text>
                        <Text style={styles.existingWinnerMonth}>Month {winner.month}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {!isEditMode && (
                <View>
                  <Button
                    mode="outlined"
                    onPress={() => setShowAddMemberModal(true)}
                    style={styles.addMemberButton}
                    icon="account-plus"
                  >
                    Add Members
                  </Button>

                  <View style={styles.membersContainer}>
                    {members.map((member, index) => (
                      <Chip
                        key={`member-${index}-${member.name}`}
                        onClose={() => removeMember(index)}
                        style={styles.memberChip}
                        avatar={
                          member.type === 'existing' ? (
                            <Text>👤</Text>
                          ) : undefined
                        }
                      >
                        {member.name} {member.type === 'existing' && `(${member.uniqueCode})`}
                      </Chip>
                    ))}
                  </View>

                  <Button mode="outlined" style={styles.shareButton}>
                    Share Invite Link
                  </Button>
                </View>
              )}
            </Card>
            </View>
          </> )} {/* end isNewKuri || isEditMode */}

          {/* Existing Kuri Tab */}
          {!isNewKuri && !isEditMode && (
            <>
              <View>
                <Card style={styles.formCard}>
                  <Text style={styles.cardTitle}>Kuri Details</Text>
                  <Text style={styles.sectionSubtitle}>
                    Record an offline kuri that's already running and bring it into the app.
                  </Text>

                  <TextInput
                    label="Group Name *"
                    value={existingFormData.groupName}
                    onChangeText={text => setExistingFormData({ ...existingFormData, groupName: text })}
                    style={[styles.input, { marginTop: 12 }]}
                    mode="outlined"
                  />

                  <TextInput
                    label="Monthly Amount (₹) *"
                    value={existingFormData.monthlyAmount}
                    onChangeText={text => setExistingFormData({ ...existingFormData, monthlyAmount: text })}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                  />

                  <TextInput
                    label="Duration (Months) *"
                    value={existingFormData.duration}
                    onChangeText={text => setExistingFormData({ ...existingFormData, duration: text })}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="e.g. 12"
                  />

                  <TouchableOpacity onPress={() => setShowExistingDatePicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        label="Start Date"
                        value={existingFormData.startDate}
                        style={styles.input}
                        mode="outlined"
                        placeholder="YYYY-MM-DD"
                        editable={false}
                        right={<TextInput.Icon icon="calendar" />}
                      />
                    </View>
                  </TouchableOpacity>
                  {showExistingDatePicker && (
                    <DateTimePicker
                      value={existingFormData.startDate ? new Date(existingFormData.startDate) : new Date()}
                      mode="date"
                      display="default"
                      onChange={onExistingDateChange}
                    />
                  )}

                  <TouchableOpacity onPress={() => setShowKuriTakenDatePicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        label="Kuri Taken Date (Optional)"
                        value={existingFormData.kuriTakenDate}
                        style={styles.input}
                        mode="outlined"
                        placeholder="Date amount was taken"
                        editable={false}
                        right={<TextInput.Icon icon="calendar" />}
                      />
                    </View>
                  </TouchableOpacity>
                  {showKuriTakenDatePicker && (
                    <DateTimePicker
                      value={existingFormData.kuriTakenDate ? new Date(existingFormData.kuriTakenDate) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowKuriTakenDatePicker(false);
                        if (selectedDate) {
                          setExistingFormData({
                            ...existingFormData,
                            kuriTakenDate: selectedDate.toISOString().split('T')[0],
                          });
                        }
                      }}
                    />
                  )}

                  <TextInput
                    label="Description (Optional)"
                    value={existingFormData.description}
                    onChangeText={text => setExistingFormData({ ...existingFormData, description: text })}
                    style={styles.input}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                  />
                </Card>
              </View>

              <View>
                <Card style={styles.membersCard}>
                  <Text style={styles.cardTitle}>Add Members</Text>
                  <Button
                    mode="outlined"
                    onPress={() => setShowExistingAddMemberModal(true)}
                    style={styles.addMemberButton}
                    icon="account-plus"
                  >
                    Add Members
                  </Button>
                  <View style={styles.membersContainer}>
                    {existingMembers.map((member, index) => (
                      <Chip
                        key={`ex-member-${index}-${member.name}`}
                        onClose={() => setExistingMembers(existingMembers.filter((_, i) => i !== index))}
                        style={styles.memberChip}
                        avatar={member.type === 'existing' ? <Text>👤</Text> : undefined}
                      >
                        {member.name}{member.type === 'existing' && member.uniqueCode ? ` (${member.uniqueCode})` : ''}
                      </Chip>
                    ))}
                  </View>
                </Card>
              </View>
            </>
          )}

          {/* Submit Button */}
          <View>
            <Button
              mode="contained"
              onPress={isNewKuri || isEditMode ? handleSubmit : handleSubmitExisting}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              loading={loading}
              disabled={loading}
            >
              {loading
                ? (isEditMode ? 'Updating...' : isNewKuri ? 'Creating...' : 'Saving...')
                : (isEditMode ? 'Update Kuri' : isNewKuri ? 'Create Kuri' : 'Save Existing Kuri')
              }
            </Button>
          </View>
        </ScrollView>

        {/* Add Member Modal - New Kuri */}
        <AddMemberModal
          visible={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onAddMember={handleAddMembers}
          existingMemberIds={[
            ...(user?.id ? [user.id] : []),
            ...members.filter(m => m.id).map(m => m.id!)
          ]}
        />

        {/* Add Member Modal - Existing Kuri */}
        <AddMemberModal
          visible={showExistingAddMemberModal}
          onClose={() => setShowExistingAddMemberModal(false)}
          onAddMember={async (type, data) => {
            if (type === 'existing' && data.userIds) {
              const newMembers: MemberItem[] = data.userIds.map(id => ({
                name: id,
                id,
                type: 'existing',
              }));
              setExistingMembers([...existingMembers, ...newMembers]);
            } else if (type === 'new' && data.names) {
              const newMembers: MemberItem[] = data.names.map(name => ({
                name,
                type: 'dummy',
              }));
              setExistingMembers([...existingMembers, ...newMembers]);
            }
          }}
          existingMemberIds={[
            ...(user?.id ? [user.id] : []),
            ...existingMembers.filter(m => m.id).map(m => m.id!)
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    padding: 12,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  backIcon: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  formCard: {
    marginBottom: 24,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  durationChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedDuration: {
    backgroundColor: '#2196F3',
  },
  durationText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '500',
    color: '#666',
  },
  selectedDurationText: {
    color: 'white',
  },
  membersCard: {
    marginBottom: 24,
    padding: 20,
  },
  addMemberContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  memberInput: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  addButton: {
    alignSelf: 'center',
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  memberChip: {
    backgroundColor: '#ffffff',
  },
  addMemberButton: {
    marginBottom: 16,
    borderColor: '#2196F3',
  },
  shareButton: {
    borderColor: '#2196F3',
  },
  existingMembersContainer: {
    marginBottom: 16,
  },
  existingMemberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  existingMemberName: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#333',
  },
  existingMemberCode: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#666',
  },
  existingWinnersContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  existingWinnerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  existingWinnerName: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#333',
  },
  existingWinnerMonth: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#2196F3',
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#666',
    marginBottom: 8,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#333',
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  submitButton: {
    marginBottom: 60,
    backgroundColor: '#2196F3',
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    maxHeight: 200,
    zIndex: 1000,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultName: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#333',
  },
  resultCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
