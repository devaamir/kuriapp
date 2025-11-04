import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Searchbar, FAB } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { RootState } from '../store';
import { setActiveFilter } from '../store';
import { GroupCard } from '../components/GroupCard';
import { PlusIcon, SearchIcon, CloseIcon } from '../components/TabIcons';
import { Group } from '../types';

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
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'my_groups', label: 'My Groups' },
    { key: 'completed', label: 'Completed' },
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

  const motivationalQuotes = [
    'Save today, secure tomorrow! 💪',
    'Every contribution counts! 🌟',
    'Building wealth together! 🚀',
  ];

  const randomQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E3F2FD', '#F8F9FA']} style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.logo}>Kuripp</Text>
            </View>
          </View>

          {/* Greeting */}
          <Animatable.View
            animation="fadeInDown"
            duration={800}
            style={styles.greeting}
          >
            <Text style={styles.greetingText}>Hi, {user.name}! 👋</Text>
            <Text style={styles.motivationText}>{randomQuote}</Text>
          </Animatable.View>

          {/* Search */}
          <Searchbar
            placeholder="Search groups..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            icon={() => <SearchIcon width={20} height={20} fill="#666" />}
            clearIcon={searchQuery ? () => <CloseIcon width={20} height={20} fill="#666" /> : undefined}
          />

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {filterTabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key && styles.activeFilterTab,
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
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Groups List */}
          <View style={styles.groupsList}>
            {filteredGroups.map(group => (
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
            ))}
          </View>
        </ScrollView>

        {/* FAB */}
        <FAB
          icon={() => <PlusIcon width={20} height={20} fill="white" />}
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
  scrollView: {
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
  headerLeft: {
    flex: 1,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2196F3',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  iconEmoji: {
    fontSize: 20,
  },
  greeting: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  searchBar: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  filterTab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginRight: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  activeFilterTab: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  groupsList: {
    paddingHorizontal: 24,
    paddingBottom: 120,
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
