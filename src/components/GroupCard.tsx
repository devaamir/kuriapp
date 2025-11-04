import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { Card } from 'react-native-paper';
import { Group } from '../types';

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
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'pending':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  return (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Card style={styles.card}>
          <View style={styles.header}>
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

          <View style={styles.details}>
            <Text style={styles.amount}>₹{group.amount.toLocaleString()}</Text>
            <Text style={styles.members}>{group.members.length} members</Text>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Month {group.currentMonth} of {group.duration}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${group.progress}%` }]}
              />
            </View>
          </View>

          {group.status === 'active' && (
            <>
              <Text style={styles.nextDraw}>
                Next Draw: {group.nextDrawDate}
              </Text>
              <View style={styles.actions}>
                {onPayNow && (
                  <Button
                    mode="contained"
                    onPress={onPayNow}
                    style={styles.button}
                  >
                    Pay Now
                  </Button>
                )}
                {onSpinNow && (
                  <Button
                    mode="outlined"
                    onPress={onSpinNow}
                    style={styles.button}
                  >
                    Spin Now
                  </Button>
                )}
              </View>
            </>
          )}
        </Card>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2196F3',
  },
  members: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  nextDraw: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
  },
});
