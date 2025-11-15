import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { LineChart, PieChart } from 'react-native-chart-kit';

import { RootState } from '../store';
import { Card } from '../components/Card';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

// Import SVG icons
import GroupIcon from '../assets/icons/group-icon.svg';
import TrophyIcon from '../assets/icons/trophy-line.svg';
import WarningIcon from '../assets/icons/warning-icon.svg';
import GraphIcon from '../assets/icons/graph-icon.svg';
import ChartIcon from '../assets/icons/chart-icon.svg';

const { width } = Dimensions.get('window');

interface AnalyticsScreenProps {
  navigation: any;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  navigation,
}) => {
  const { analytics } = useSelector((state: RootState) => state.app);
  const [timeFilter, setTimeFilter] = useState('monthly');

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(255, 255, 255, 0)',
    backgroundGradientTo: 'rgba(255, 255, 255, 0)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: BorderRadius.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  const pieData = [
    {
      name: 'Paid',
      population: analytics.paidVsUnpaid.paid,
      color: Colors.success,
      legendFontColor: Colors.textPrimary,
      legendFontSize: 12,
    },
    {
      name: 'Unpaid',
      population: analytics.paidVsUnpaid.unpaid,
      color: Colors.error,
      legendFontColor: Colors.textPrimary,
      legendFontSize: 12,
    },
  ];

  const lineData = {
    labels: analytics.contributionOverTime.map(item => item.month.slice(0, 3)),
    datasets: [
      {
        data: analytics.contributionOverTime.map(item => item.amount),
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header with gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <ChartIcon width={24} height={24} color={Colors.white} />
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
          <Text style={styles.headerSubtitle}>Track your kuri performance</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>₹{analytics.totalContributions.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Contributions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.completionRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </Card>
        </View>

        {/* Time Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'weekly' && styles.activeFilter]}
            onPress={() => setTimeFilter('weekly')}
          >
            <Text style={[styles.filterText, timeFilter === 'weekly' && styles.activeFilterText]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'monthly' && styles.activeFilter]}
            onPress={() => setTimeFilter('monthly')}
          >
            <Text style={[styles.filterText, timeFilter === 'monthly' && styles.activeFilterText]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <Card style={styles.overviewCard}>
            <GroupIcon width={24} height={24} color={Colors.primary} />
            <Text style={styles.overviewValue}>{analytics.totalGroups}</Text>
            <Text style={styles.overviewLabel}>Total Groups</Text>
          </Card>
          <Card style={styles.overviewCard}>
            <TrophyIcon width={24} height={24} color={Colors.success} />
            <Text style={styles.overviewValue}>{analytics.totalWins}</Text>
            <Text style={styles.overviewLabel}>Total Wins</Text>
          </Card>
          <Card style={styles.overviewCard}>
            <WarningIcon width={24} height={24} color={Colors.error} />
            <Text style={styles.overviewValue}>{analytics.missedPayments}</Text>
            <Text style={styles.overviewLabel}>Missed Payments</Text>
          </Card>
          <Card style={styles.overviewCard}>
            <GraphIcon width={24} height={24} color={Colors.primary} />
            <Text style={styles.overviewValue}>{analytics.totalGroups - 1}</Text>
            <Text style={styles.overviewLabel}>Active Groups</Text>
          </Card>
        </View>

        {/* Contribution Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Contribution Trends</Text>
          <LineChart
            data={lineData}
            width={width - 80}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Payment Status */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Payment Status</Text>
          <PieChart
            data={pieData}
            width={width - 80}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Monthly Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Contribution</Text>
            <Text style={styles.summaryValue}>
              ₹{Math.round(analytics.totalContributions / 3).toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completion Rate</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {analytics.completionRate}%
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Success</Text>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>
              {Math.round((analytics.paidVsUnpaid.paid / (analytics.paidVsUnpaid.paid + analytics.paidVsUnpaid.unpaid)) * 100)}%
            </Text>
          </View>
        </Card>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: Colors.primaryLight,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilter: {
    backgroundColor: Colors.white,
  },
  filterText: {
    ...Typography.body2,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    marginTop: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  overviewCard: {
    width: (width - Spacing.lg * 3) / 2,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  overviewValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  overviewLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  chartTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: BorderRadius.md,
  },
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  summaryLabel: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
