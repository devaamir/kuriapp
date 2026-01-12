import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Card } from './Card';
import { Button } from './Button';
import { Group } from '../types';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  onPayNow?: () => void;
  onSpinNow?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onPress,
  onPayNow,
  onSpinNow,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'completed':
        return Colors.primary;
      case 'pending':
        return Colors.warning;
      default:
        return Colors.gray400;
    }
  };

  // Helper to parse duration string "12 Months" -> 12
  const getDurationMonths = (durationStr: string): number => {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const durationMonths = getDurationMonths(group.duration);

  // Calculate progress and current month
  const calculateProgress = () => {
    const start = new Date(group.startDate);
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

  // Calculate next draw date (same day as start date in the next month)
  const getNextDrawDate = () => {
    const startDate = new Date(group.startDate);
    const now = new Date();

    // Calculate next draw date (same day as start date in current/next month)
    const nextDraw = new Date(
      now.getFullYear(),
      now.getMonth(),
      startDate.getDate(),
    );

    // If the draw date has passed this month, move to next month
    if (nextDraw <= now) {
      nextDraw.setMonth(nextDraw.getMonth() + 1);
    }

    return nextDraw.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Card style={styles.card}>
        {/* Header with gradient accent */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.groupName}>{group.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(group.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {group.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount and Members */}
        <View style={styles.details}>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              ₹{parseInt(group.monthlyAmount).toLocaleString()}
            </Text>
            <Text style={styles.amountLabel}>per month</Text>
          </View>
          <View style={styles.membersContainer}>
            <Text style={styles.membersCount}>{group.memberIds.length}</Text>
            <Text style={styles.membersLabel}>members</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Month {currentMonth} of {durationMonths}
            </Text>
            <Text style={styles.progressPercentage}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: Colors.primary },
              ]}
            />
          </View>
        </View>

        {/* Next Draw Info */}
        {group.status === 'active' && (
          <View style={styles.nextDrawContainer}>
            <Text style={styles.nextDrawLabel}>Next Draw</Text>
            <Text style={styles.nextDrawDate}>{getNextDrawDate()}</Text>
          </View>
        )}

        {/* Actions */}
        {group.status === 'active' && (
          <View style={styles.actions}>
            {onPayNow && (
              <Button
                title="Pay Now"
                onPress={onPayNow}
                variant="primary"
                size="small"
                style={styles.actionButton}
              />
            )}
            {onSpinNow && (
              <Button
                title="Spin Now"
                onPress={onSpinNow}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  amountContainer: {
    flex: 1,
  },
  amount: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  amountLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  membersContainer: {
    alignItems: 'flex-end',
  },
  membersCount: {
    ...Typography.h4,
    color: Colors.secondary,
    marginBottom: Spacing.xs,
  },
  membersLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  progressPercentage: {
    ...Typography.label,
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  nextDrawContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  nextDrawLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  nextDrawDate: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
