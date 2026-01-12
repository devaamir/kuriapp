import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Button, FAB, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';

import { BackArrowIcon, NotificationIcon } from '../components/TabIcons';
import { RootState } from '../store';
import { updateGroup, setLoading, setError } from '../store';
import { kuriService } from '../services/kuriService';
import { Card } from '../components/Card';
import { Group, Member } from '../types';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

interface GroupDetailsScreenProps {
  navigation: any;
  route: any;
}

// Local interface for UI that includes full member details
interface ExtendedGroup extends Omit<Group, 'memberIds'> {
  members: Member[];
  winners?: { memberId: string; month: number }[];
}

export const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { groupId } = route.params;
  const dispatch = useDispatch();
  const { groups, loading, user } = useSelector(
    (state: RootState) => state.app,
  );
  const reduxGroup = groups.find(g => g.id === groupId);

  // Local state to hold full group details including members
  const [groupDetails, setGroupDetails] = useState<ExtendedGroup | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [memberFilter, setMemberFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadGroupDetails = async () => {
    try {
      dispatch(setLoading(true));
      const kuriData = await kuriService.getKuriDetails(groupId);

      console.log(kuriData, 'Kuri Details Response');
      console.log(kuriData.winners, 'Winners Data');

      // Transform API data to local ExtendedGroup
      const extendedGroup: ExtendedGroup = {
        id: kuriData.id,
        name: kuriData.name,
        description: kuriData.description,
        monthlyAmount: kuriData.monthlyAmount.toString(),
        status: kuriData.status,
        type: 'new',
        duration: kuriData.duration,
        startDate: kuriData.startDate,
        adminId: kuriData.adminId,
        createdBy: kuriData.adminId,
        winners: kuriData.winners || [],
        members: kuriData.members.map(member => {
          const memberPayments = (kuriData.payments || []).filter(
            p => p.memberId === member.id,
          );
          const hasPaid = memberPayments.some(p => p.status === 'paid');

          return {
            id: member.id,
            name: member.name,
            uniqueCode: member.uniqueCode,
            avatar: member.avatar,
            role: member.role,
            isDummy: false,
            phone: '',
            email: member.email,
            hasPaid,
            hasWon: false,
            joinDate: new Date().toISOString().split('T')[0],
          };
        }),
      };

      setGroupDetails(extendedGroup);

      // Update Redux with strict Group interface (memberIds only)
      const reduxUpdate: Partial<Group> = {
        ...extendedGroup,
        memberIds: kuriData.memberIds,
      };
      // Remove members from reduxUpdate to avoid type error
      delete (reduxUpdate as any).members;

      dispatch(updateGroup({ id: groupId, updates: reduxUpdate }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to load group details';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroupDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  // Use local details if available, otherwise fall back to redux group (which might miss members)
  const currentGroup = groupDetails;

  if (!currentGroup && !reduxGroup) {
    return (
      <View style={styles.container}>
        <Text>Group not found</Text>
      </View>
    );
  }

  // Helper to parse duration string "12 Months" -> 12
  const getDurationMonths = (durationStr: string): number => {
    if (!durationStr) return 0;
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const durationMonths = currentGroup
    ? getDurationMonths(currentGroup.duration)
    : 0;

  // Calculate progress and current month
  const calculateProgress = () => {
    if (!currentGroup) return { currentMonth: 0, progress: 0 };
    const start = new Date(currentGroup.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

    const currentMonth = Math.min(diffMonths, durationMonths);
    const progress =
      durationMonths > 0
        ? Math.round((currentMonth / durationMonths) * 100)
        : 0;

    return { currentMonth, progress };
  };

  const { currentMonth, progress } = calculateProgress();

  const tabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'members', label: 'Members' },
    { key: 'agreement', label: 'Agreement' },
    { key: 'chat', label: 'Chat' },
  ];

  const isAdmin = currentGroup?.adminId === user?.id;

  const memberFilters = [
    { key: 'all', label: 'All' },
    ...(isAdmin
      ? [
          { key: 'paid', label: 'Paid' },
          { key: 'unpaid', label: 'Unpaid' },
        ]
      : []),
    { key: 'winners', label: 'Winners' },
  ];

  const filteredMembers = currentGroup
    ? memberFilter === 'winners'
      ? (currentGroup.winners || [])
          .map(winner => {
            const member = currentGroup.members.find(
              m => m.id === winner.memberId,
            );
            return member ? { ...member, winnerMonth: winner.month } : null;
          })
          .filter(Boolean)
      : (currentGroup.members || []).filter((member: Member) => {
          switch (memberFilter) {
            case 'paid':
              return member.hasPaid;
            case 'unpaid':
              return !member.hasPaid;
            default:
              return true;
          }
        })
    : [];

  const renderCountdown = () => {
    if (!currentGroup) return null;

    const startDate = new Date(currentGroup.startDate);
    const now = new Date();

    // Calculate next draw date (same day as start date in the next month)
    const nextDrawDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      startDate.getDate(),
    );

    // If the draw date has passed this month, move to next month
    if (nextDrawDate <= now) {
      nextDrawDate.setMonth(nextDrawDate.getMonth() + 1);
    }

    // Check if we've exceeded duration
    if (currentMonth >= durationMonths) {
      return (
        <Card style={styles.countdownCard}>
          <Text style={styles.countdownTitle}>Next Draw</Text>
          <Text style={styles.countdownTime}>Kuri Completed</Text>
        </Card>
      );
    }

    const diff = nextDrawDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <Card style={styles.countdownCard}>
        <Text style={styles.countdownTitle}>Next Draw In</Text>
        <Text style={styles.countdownTime}>{days} days</Text>
        <Button
          mode="contained"
          style={styles.spinButton}
          onPress={() => navigation.navigate('SpinWheel', { groupId: groupId })}
        >
          Spin Now
        </Button>
      </Card>
    );
  };

  const renderSummaryTab = () => {
    const lastWinner =
      currentGroup?.winners && currentGroup.winners.length > 0
        ? currentGroup.winners[currentGroup.winners.length - 1]
        : null;
    const lastWinnerMember = lastWinner
      ? currentGroup?.members.find(m => m.id === lastWinner.memberId)
      : null;

    return (
      <View>
        {renderCountdown()}

        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Group Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹
                {(
                  parseInt(currentGroup?.monthlyAmount || '0') * currentMonth
                ).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Collected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(currentGroup?.members || []).filter(m => m.hasPaid).length}
              </Text>
              <Text style={styles.statLabel}>Paid Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentGroup?.duration || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentMonth}/{durationMonths}
              </Text>
              <Text style={styles.statLabel}>Completion ({progress}%)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {lastWinnerMember ? lastWinnerMember.name : 'None'}
              </Text>
              <Text style={styles.statLabel}>Last Winner</Text>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  const renderMembersTab = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.memberFilters}
      >
        {memberFilters.map(filter => (
          <Chip
            key={filter.key}
            selected={memberFilter === filter.key}
            onPress={() => setMemberFilter(filter.key)}
            style={styles.memberFilterChip}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>

      {filteredMembers.map((member, index) => (
        <View key={member.id}>
          <Card style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>
                  {member.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberPhone}>
                  {memberFilter === 'winners' && member.winnerMonth
                    ? `Month ${member.winnerMonth}`
                    : member.email}
                </Text>
              </View>
              <View style={styles.memberStatus}>
                {memberFilter === 'winners' && (
                  <Text style={styles.statusEmoji}>🏆</Text>
                )}
                {memberFilter !== 'winners' && member.hasPaid && (
                  <Text style={styles.statusEmoji}>✅</Text>
                )}
              </View>
            </View>
          </Card>
        </View>
      ))}
    </View>
  );

  const renderAgreementTab = () => (
    <Card style={styles.agreementCard}>
      <Text style={styles.cardTitle}>Group Agreement</Text>
      <ScrollView style={styles.agreementScroll}>
        <Text style={styles.agreementText}>{currentGroup?.description}</Text>
        <Text style={styles.agreementText}>
          {'\n'}Terms and Conditions:{'\n'}
          1. Monthly contribution must be paid by the 15th of each month{'\n'}
          2. Draw will be conducted on the specified date{'\n'}
          3. Winner will receive the full amount collected{'\n'}
          4. No refunds after joining the group{'\n'}
          5. All members must agree to the terms
        </Text>
      </ScrollView>
      <View style={styles.agreementActions}>
        <Button mode="outlined" style={styles.agreementButton}>
          Download
        </Button>
        <Button mode="contained" style={styles.agreementButton}>
          Agree
        </Button>
      </View>
    </Card>
  );

  const renderChatTab = () => (
    <Card style={styles.chatCard}>
      <Text style={styles.cardTitle}>Group Chat</Text>
      <View style={styles.chatContainer}>
        <Text style={styles.chatPlaceholder}>Chat feature coming soon...</Text>
        <Text style={styles.chatSubtext}>Connect with your group members</Text>
      </View>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return renderSummaryTab();
      case 'members':
        return renderMembersTab();
      case 'agreement':
        return renderAgreementTab();
      case 'chat':
        return renderChatTab();
      default:
        return renderSummaryTab();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackArrowIcon width={20} height={20} fill="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentGroup?.name || reduxGroup?.name}
          </Text>
          <View style={styles.headerActions}>
            {isAdmin && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('CreateKuri', { 
                  mode: 'edit', 
                  kuriId: groupId,
                  kuriData: currentGroup 
                })}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconButton}>
              <NotificationIcon width={20} height={20} fill="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabContainer}
          >
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderTabContent()}
        </ScrollView>

        {/* FAB */}
        <FAB
          icon={() => <Text style={styles.fabIcon}>👥</Text>}
          style={styles.fab}
          onPress={() => console.log('Add member')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h2,
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  editIcon: {
    fontSize: 18,
  },
  tabContainer: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  countdownCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  countdownTitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  countdownTime: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  spinButton: {
    paddingHorizontal: 40,
  },
  statsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  memberFilters: {
    marginBottom: Spacing.md,
  },
  memberFilterChip: {
    marginRight: Spacing.sm,
  },
  memberCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  memberInitial: {
    ...Typography.body,
    color: Colors.white,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: 4,
  },
  memberPhone: {
    ...Typography.caption,
    // color: Colors.textSecondary,
  },
  memberStatus: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusEmoji: {
    fontSize: 20,
  },
  agreementScroll: {
    maxHeight: 300,
    marginBottom: Spacing.lg,
  },
  agreementText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  agreementActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  agreementButton: {
    flex: 1,
  },
  chatContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  chatPlaceholder: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  chatSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: Spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  fabIcon: {
    fontSize: 20,
    color: Colors.white,
  },
  agreementCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  chatCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  winnersCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  winnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  winnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  winnerInitial: {
    ...Typography.body,
    color: Colors.white,
  },
  winnerDetails: {
    flex: 1,
  },
  winnerName: {
    ...Typography.body,
    color: Colors.text,
  },
  winnerMonth: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
