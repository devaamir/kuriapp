import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Searchbar, FAB } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { RootState } from '../store';
import { setActiveFilter } from '../store';
import { GroupCard } from '../components/GroupCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PlusIcon, SearchIcon, CloseIcon } from '../components/TabIcons';
import { Group } from '../types';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { groups, activeFilter, user } = useSelector(
    (state: RootState) => state.app,
  );
  const [searchQuery, setSearchQuery] = React.useState('');

  const filterTabs = [
    { key: 'all', label: 'All', count: groups.length },
    {
      key: 'active',
      label: 'Active',
      count: groups.filter(g => g.status === 'active').length,
    },
    {
      key: 'my_groups',
      label: 'My Groups',
      count: groups.filter(g => g.members.some(m => m.id === user.id)).length,
    },
    {
      key: 'completed',
      label: 'Completed',
      count: groups.filter(g => g.status === 'completed').length,
    },
  ];

  const filteredGroups = groups.filter((group: Group) => {
    const matchesSearch = group.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'active' && group.status === 'active') ||
      (activeFilter === 'completed' && group.status === 'completed') ||
      (activeFilter === 'my_groups' &&
        group.members.some(m => m.id === user.id));

    return matchesSearch && matchesFilter;
  });

  const activeGroups = groups.filter(
    g => g.status === 'active' && g.members.some(m => m.id === user.id),
  ).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header with gradient */}
      <LinearGradient colors={Colors.gradientPrimary} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user.name}! 👋</Text>
            <Text style={styles.subtitle}>
              Let's grow your savings together
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>₹{10000}</Text>
            <Text style={styles.statLabel}>Total Savings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{activeGroups}</Text>
            <Text style={styles.statLabel}>Active Groups</Text>
          </Card>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Search */}
        <Searchbar
          placeholder="Search your groups..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon={() => (
            <SearchIcon width={20} height={20} fill={Colors.gray400} />
          )}
          clearIcon={
            searchQuery
              ? () => <CloseIcon width={20} height={20} fill={Colors.gray400} />
              : undefined
          }
        />

        {/* Filter Tabs */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filterTabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key && styles.activeFilterTab,
                  { marginLeft: tab.key === 'all' ? Spacing.lg : 0 },
                ]}
                onPress={() => dispatch(setActiveFilter(tab.key as any))}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === tab.key && styles.activeFilterText,
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.filterBadge,
                    activeFilter === tab.key && styles.activeFilterBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      activeFilter === tab.key && styles.activeFilterBadgeText,
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Groups List */}
        <ScrollView
          style={styles.groupsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.groupsContent}
        >
          {filteredGroups.length > 0 ? (
            filteredGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() =>
                  navigation.navigate('GroupDetails', { groupId: group.id })
                }
                onPayNow={() => console.log('Pay now for', group.name)}
                onSpinNow={() =>
                  navigation.navigate('SpinWheel', { groupId: group.id })
                }
              />
            ))
          ) : (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No groups found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Create your first group to get started'}
              </Text>
              {!searchQuery && (
                <Button
                  title="Create Group"
                  onPress={() => navigation.navigate('CreateKuri')}
                  style={styles.emptyButton}
                />
              )}
            </Card>
          )}
        </ScrollView>
      </View>

      {/* FAB */}
      <FAB
        icon={() => <PlusIcon width={24} height={24} fill={Colors.white} />}
        style={styles.fab}
        onPress={() => navigation.navigate('CreateKuri')}
      />
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.primaryLight,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
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
    // paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
  },
  searchBar: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  searchInput: {
    ...Typography.body1,
  },
  filterContainer: {
    marginBottom: Spacing.lg,
  },
  filterWrapper: {
    // marginBottom: Spacing.lg,
  },
  filterContent: {
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  activeFilterText: {
    color: Colors.white,
  },
  filterBadge: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: Colors.primaryLight,
  },
  filterBadgeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterBadgeText: {
    color: Colors.primary,
  },
  groupsList: {
    flex: 1,
    marginHorizontal: Spacing.lg,
  },
  groupsContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    marginTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: Spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
});
