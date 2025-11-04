import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, FAB, Chip } from 'react-native-paper';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BackArrowIcon, NotificationIcon } from '../components/TabIcons';
import { RootState } from '../store';
import { Card } from 'react-native-paper';
import { Member } from '../types';

interface GroupDetailsScreenProps {
  navigation: any;
  route: any;
}

export const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { groupId } = route.params;
  const { groups } = useSelector((state: RootState) => state.app);
  const group = groups.find(g => g.id === groupId);
  const [activeTab, setActiveTab] = useState('summary');
  const [memberFilter, setMemberFilter] = useState('all');

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Group not found</Text>
      </View>
    );
  }

  const tabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'members', label: 'Members' },
    { key: 'agreement', label: 'Agreement' },
    { key: 'chat', label: 'Chat' },
  ];

  const memberFilters = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'winners', label: 'Winners' },
  ];

  const filteredMembers = group.members.filter((member: Member) => {
    switch (memberFilter) {
      case 'paid':
        return member.hasPaid;
      case 'unpaid':
        return !member.hasPaid;
      case 'winners':
        return member.hasWon;
      default:
        return true;
    }
  });

  const renderCountdown = () => (
    <Card style={styles.countdownCard}>
      <Text style={styles.countdownTitle}>Next Draw In</Text>
      <Text style={styles.countdownTime}>2d 14h 32m</Text>
      <Button
        mode="contained"
        style={styles.spinButton}
        onPress={() => navigation.navigate('SpinWheel', { groupId: group.id })}
      >
        Spin Now
      </Button>
    </Card>
  );

  const renderSummaryTab = () => (
    <View>
      {renderCountdown()}

      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Group Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ₹{(group.amount * group.currentMonth).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Collected</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {group.members.filter(m => m.hasPaid).length}
            </Text>
            <Text style={styles.statLabel}>Paid Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{group.progress}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{group.lastWinner || 'None'}</Text>
            <Text style={styles.statLabel}>Last Winner</Text>
          </View>
        </View>
      </Card>
    </View>
  );

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
        <Animatable.View
          key={member.id}
          animation="fadeInUp"
          delay={index * 100}
        >
          <Card style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>
                  {member.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberPhone}>{member.phone}</Text>
              </View>
              <View style={styles.memberStatus}>
                {member.hasPaid && <Text style={styles.statusEmoji}>✅</Text>}
                {member.hasWon && <Text style={styles.statusEmoji}>🏆</Text>}
              </View>
            </View>
          </Card>
        </Animatable.View>
      ))}
    </View>
  );

  const renderAgreementTab = () => (
    <Card style={styles.agreementCard}>
      <Text style={styles.cardTitle}>Group Agreement</Text>
      <ScrollView style={styles.agreementScroll}>
        <Text style={styles.agreementText}>{group.agreement}</Text>
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
      <LinearGradient colors={['#E3F2FD', '#F8F9FA']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackArrowIcon width={20} height={20} fill="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{group.name}</Text>
          <View style={styles.headerActions}>
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>

        {/* FAB */}
        <FAB
          icon={() => <Text style={styles.fabIcon}>👥</Text>}
          style={styles.fab}
          onPress={() => console.log('Add member')}
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
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  iconEmoji: {
    fontSize: 20,
  },
  tabContainer: {
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    // maxHeight: 350,
    paddingHorizontal: 24,
  },
  countdownCard: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 24,
  },
  countdownTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 24,
  },
  spinButton: {
    paddingHorizontal: 40,
  },
  statsCard: {
    marginBottom: 24,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  memberFilters: {
    marginBottom: 20,
  },
  memberFilterChip: {
    marginRight: 12,
  },
  memberCard: {
    marginBottom: 16,
    padding: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  memberInitial: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
  },
  memberStatus: {
    flexDirection: 'row',
    gap: 12,
  },
  statusEmoji: {
    fontSize: 20,
  },
  agreementScroll: {
    maxHeight: 300,
    marginBottom: 24,
  },
  agreementText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  agreementActions: {
    flexDirection: 'row',
    gap: 16,
  },
  agreementButton: {
    flex: 1,
  },
  chatContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  chatPlaceholder: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  chatSubtext: {
    fontSize: 14,
    color: '#999',
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
  agreementCard: {
    marginBottom: 24,
    padding: 20,
  },
  chatCard: {
    marginBottom: 24,
    padding: 20,
  },
});
