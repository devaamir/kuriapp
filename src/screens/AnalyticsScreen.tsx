import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { RootState } from '../store';
import { Card } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

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
    backgroundGradientFrom: 'rgba(255, 255, 255, 0.1)',
    backgroundGradientTo: 'rgba(255, 255, 255, 0.1)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2196F3',
    },
  };

  const pieData = [
    {
      name: 'Paid',
      population: analytics.paidVsUnpaid.paid,
      color: '#4CAF50',
      legendFontColor: '#1a1a1a',
      legendFontSize: 14,
    },
    {
      name: 'Unpaid',
      population: analytics.paidVsUnpaid.unpaid,
      color: '#FF5722',
      legendFontColor: '#1a1a1a',
      legendFontSize: 14,
    },
  ];

  const progressData = {
    data: [analytics.completionRate / 100],
  };

  const lineData = {
    labels: analytics.contributionOverTime.map(item => item.month),
    datasets: [
      {
        data: analytics.contributionOverTime.map(item => item.amount),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const dashboardTiles = [
    {
      title: 'Total Groups',
      value: analytics.totalGroups,
      icon: '👥',
      color: '#2196F3',
    },
    {
      title: 'Contributions',
      value: `₹${analytics.totalContributions.toLocaleString()}`,
      icon: '💰',
      color: '#4CAF50',
    },
    {
      title: 'Missed Payments',
      value: analytics.missedPayments,
      icon: '⚠️',
      color: '#FF5722',
    },
    {
      title: 'Total Wins',
      value: analytics.totalWins,
      icon: '🏆',
      color: '#FFD700',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E3F2FD', '#F8F9FA']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={styles.timeFilters}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timeFilter === 'weekly' && styles.activeFilter,
              ]}
              onPress={() => setTimeFilter('weekly')}
            >
              <Text
                style={[
                  styles.filterText,
                  timeFilter === 'weekly' && styles.activeFilterText,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timeFilter === 'monthly' && styles.activeFilter,
              ]}
              onPress={() => setTimeFilter('monthly')}
            >
              <Text
                style={[
                  styles.filterText,
                  timeFilter === 'monthly' && styles.activeFilterText,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Dashboard Tiles */}
          <View style={styles.tilesContainer}>
            {dashboardTiles.map((tile, index) => (
              <Animatable.View
                key={tile.title}
                animation="fadeInUp"
                delay={index * 100}
                style={styles.tileWrapper}
              >
                <Card style={styles.tile}>
                  <Text style={styles.tileIcon}>{tile.icon}</Text>
                  <Text style={[styles.tileValue, { color: tile.color }]}>
                    {tile.value}
                  </Text>
                  <Text style={styles.tileTitle}>{tile.title}</Text>
                </Card>
              </Animatable.View>
            ))}
          </View>

          {/* Contribution Over Time Chart */}
          <Animatable.View animation="fadeInUp" delay={400}>
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Contribution Over Time</Text>
              <LineChart
                data={lineData}
                width={screenWidth - 80}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card>
          </Animatable.View>

          {/* Completion Rate */}
          <Animatable.View animation="fadeInUp" delay={600}>
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Completion Rate</Text>
              <View style={styles.progressContainer}>
                <ProgressChart
                  data={progressData}
                  width={screenWidth - 80}
                  height={200}
                  strokeWidth={16}
                  radius={80}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  }}
                  hideLegend={true}
                />
                <View style={styles.progressOverlay}>
                  <Text style={styles.progressValue}>
                    {analytics.completionRate}%
                  </Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
              </View>
            </Card>
          </Animatable.View>

          {/* Paid vs Unpaid */}
          <Animatable.View animation="fadeInUp" delay={800}>
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Payment Status</Text>
              <PieChart
                data={pieData}
                width={screenWidth - 80}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            </Card>
          </Animatable.View>

          {/* Summary Stats */}
          <Animatable.View animation="fadeInUp" delay={1000}>
            <Card style={styles.summaryCard}>
              <Text style={styles.chartTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Average Monthly Contribution
                </Text>
                <Text style={styles.summaryValue}>
                  ₹
                  {Math.round(
                    analytics.totalContributions / 3,
                  ).toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Success Rate</Text>
                <Text style={styles.summaryValue}>
                  {analytics.completionRate}%
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Active Groups</Text>
                <Text style={styles.summaryValue}>
                  {analytics.totalGroups - 1}
                </Text>
              </View>
            </Card>
          </Animatable.View>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  timeFilters: {
    flexDirection: 'row',
    gap: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  activeFilter: {
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
  },
  tileWrapper: {
    width: (screenWidth - 68) / 2,
  },
  tile: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  tileIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  tileValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  tileTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: 24,
    padding: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 16,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -20 }],
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryCard: {
    marginBottom: 60,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
