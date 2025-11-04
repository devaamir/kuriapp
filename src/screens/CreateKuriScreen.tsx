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
import { useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { addGroup } from '../store';
import { Group, Member } from '../types';
import { Fonts } from '../utils/fonts';

interface CreateKuriScreenProps {
  navigation: any;
}

export const CreateKuriScreen: React.FC<CreateKuriScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const [isNewKuri, setIsNewKuri] = useState(true);
  const [formData, setFormData] = useState({
    groupName: '',
    monthlyAmount: '',
    duration: '',
    startDate: '',
    agreement:
      'Monthly contribution as agreed. Draw will be conducted on the specified date each month. Winner receives the full collected amount.',
  });
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');

  const durations = [6, 12, 18, 24, 36];

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const removeMember = (member: string) => {
    setMembers(members.filter(m => m !== member));
  };

  const handleSubmit = () => {
    if (!formData.groupName || !formData.monthlyAmount || !formData.duration) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newGroup: Group = {
      id: Date.now().toString(),
      name: formData.groupName,
      amount: parseInt(formData.monthlyAmount),
      members: members.map((name, index) => ({
        id: (Date.now() + index).toString(),
        name,
        phone: `+123456789${index}`,
        email: `${name.toLowerCase().replace(' ', '')}@example.com`,
        hasPaid: false,
        hasWon: false,
        joinDate: new Date().toISOString().split('T')[0],
      })),
      duration: parseInt(formData.duration),
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      currentMonth: 0,
      nextDrawDate: '',
      progress: 0,
      agreement: formData.agreement,
    };

    dispatch(addGroup(newGroup));

    Alert.alert('Success!', 'Kuri created successfully!', [
      {
        text: 'Share',
        onPress: () => console.log('Share group'),
      },
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E3F2FD', '#F8F9FA']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>⬅️</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Kuri</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Toggle */}
          <View>
            <Card style={styles.toggleCard}>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>New Kuri</Text>
                <Switch value={isNewKuri} onValueChange={setIsNewKuri} />
                <Text style={styles.toggleLabel}>Existing Kuri</Text>
              </View>
            </Card>
          </View>

          {/* Form */}
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
              <View style={styles.durationContainer}>
                {durations.map(duration => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationChip,
                      formData.duration === duration.toString() &&
                        styles.selectedDuration,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        duration: duration.toString(),
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.durationText,
                        formData.duration === duration.toString() &&
                          styles.selectedDurationText,
                      ]}
                    >
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                label="Start Date"
                value={formData.startDate}
                onChangeText={text =>
                  setFormData({ ...formData, startDate: text })
                }
                style={styles.input}
                mode="outlined"
                placeholder="YYYY-MM-DD"
              />
            </Card>
          </View>

          {/* Members */}
          <View>
            <Card style={styles.membersCard}>
              <Text style={styles.cardTitle}>Add Members</Text>

              <View style={styles.addMemberContainer}>
                <TextInput
                  label="Member Name"
                  value={newMember}
                  onChangeText={setNewMember}
                  style={styles.memberInput}
                  mode="outlined"
                />
                <Button
                  mode="contained"
                  onPress={addMember}
                  style={styles.addButton}
                >
                  Add
                </Button>
              </View>

              <View style={styles.membersContainer}>
                {members.map((member, index) => (
                  <Chip
                    key={index}
                    onClose={() => removeMember(member)}
                    style={styles.memberChip}
                  >
                    {member}
                  </Chip>
                ))}
              </View>

              <Button mode="outlined" style={styles.shareButton}>
                Share Invite Link
              </Button>
            </Card>
          </View>

          {/* Agreement */}
          <View>
            <Card style={styles.agreementCard}>
              <Text style={styles.cardTitle}>Agreement</Text>

              <TextInput
                label="Terms & Conditions"
                value={formData.agreement}
                onChangeText={text =>
                  setFormData({ ...formData, agreement: text })
                }
                style={styles.agreementInput}
                mode="outlined"
                multiline
                numberOfLines={6}
              />
            </Card>
          </View>

          {/* Submit Button */}
          <View>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
            >
              Create Kuri
            </Button>
          </View>
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
    fontFamily: Fonts.semiBold,
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  toggleCard: {
    marginBottom: 24,
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  formCard: {
    marginBottom: 24,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
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
  shareButton: {
    borderColor: '#2196F3',
  },
  agreementCard: {
    marginBottom: 24,
    padding: 20,
  },
  agreementInput: {
    backgroundColor: '#ffffff',
  },
  submitButton: {
    marginBottom: 60,
    backgroundColor: '#2196F3',
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
});
