import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import EventSource from 'react-native-sse';
import ConfettiCannon from 'react-native-confetti-cannon';

import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { BackArrowIcon, SettingsIcon } from '../components/TabIcons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ParticipantsModal } from '../components/ParticipantsModal';
import { RootState } from '../store';
import { kuriService } from '../services/kuriService';
import { spinnerService } from '../services/spinnerService';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8;
const RADIUS = WHEEL_SIZE / 2;
const CENTER = RADIUS;

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001/api/v1',
  ios: 'http://localhost:3001/api/v1',
  default: 'http://localhost:3001/api/v1',
});

interface Participant {
  id: string;
  name: string;
}

interface SpinWheelScreenProps {
  navigation: any;
  route: any;
}

export const SpinWheelScreen: React.FC<SpinWheelScreenProps> = ({
  navigation,
  route,
}) => {
  const { groupId, members: paramMembers, currentMonth, winners: paramWinners, isAdmin: paramIsAdmin } = route.params;
  const { groups, user } = useSelector((state: RootState) => state.app);
  const group = groups.find(g => g.id === groupId);

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [customParticipants, setCustomParticipants] = useState<Participant[]>(
    [],
  );
  const [showModal, setShowModal] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const eventSourceRef = useRef<EventSource | null>(null);
  const confettiRef = useRef<any>(null);
  const celebrationScale = useRef(new Animated.Value(0)).current;

  // Check if current date is on or after draw date
  const canSpinNow = () => {
    if (!group?.startDate) return false;

    const now = new Date();
    const startDate = new Date(group.startDate);
    const drawDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      startDate.getDate(),
    );

    return now >= drawDate;
  };

  const getNextDrawDate = () => {
    if (!group?.startDate) return '';

    const now = new Date();
    const startDate = new Date(group.startDate);
    const drawDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      startDate.getDate(),
    );

    if (now >= drawDate) {
      drawDate.setMonth(drawDate.getMonth() + 1);
    }

    return drawDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Connect to SSE stream for non-admin users
  useEffect(() => {
    if (!isAdmin) {
      const connectSSE = () => {
        console.log('[SSE] Connecting to stream:', `${BASE_URL}/spinner/stream/${groupId}`);

        const eventSource = new EventSource(`${BASE_URL}/spinner/stream/${groupId}`);

        eventSource.addEventListener('open', () => {
          console.log('[SSE] Connected successfully');
        });

        eventSource.addEventListener('message', (event) => {
          console.log('[SSE] Message received:', event.data);
          try {
            const { speed, rotates, easing, winner: winnerId } = JSON.parse(event.data);
            const winnerMember = membersSource.find((m: any) => m.id === winnerId);

            if (winnerMember) {
              console.log('[SSE] Triggering spin - duration:', speed, 'randomRotation:', rotates, 'easing:', easing, 'winner:', winnerMember.name);
              triggerSpin(speed, rotates, winnerMember.name);
            }
          } catch (error) {
            console.error('[SSE] Failed to parse message:', error);
          }
        });

        eventSource.addEventListener('error', (error) => {
          console.error('[SSE] Connection error:', error);
          eventSource.close();

          // Reconnect after 3 seconds
          console.log('[SSE] Reconnecting in 3 seconds...');
          setTimeout(() => {
            connectSSE();
          }, 3000);
        });

        eventSourceRef.current = eventSource;
      };

      connectSSE();

      return () => {
        console.log('[SSE] Disconnecting');
        eventSourceRef.current?.close();
      };
    }
  }, [groupId, isAdmin, membersSource]);

  if (!group) return null;

  const isAdmin = paramIsAdmin;
  // Use params members if available (has full details), otherwise fallback to group.members
  const membersSource = paramMembers || [];

  // Get winners from params
  const winners = paramWinners || [];
  const winnerIds = winners.map((w: any) => w.memberId);
  console.log('winners', winners);
  console.log('winnerIds', winnerIds);
  console.log('membersSource', membersSource);

  // Pending users are those who haven't won yet
  const pendingMembers = membersSource.filter((m: any) => !winnerIds.includes(m.id));

  const defaultParticipants: Participant[] = pendingMembers.map((m: any) => ({
    id: m.id,
    name: m.name,
  }));

  const wheelNames =
    customParticipants.length > 0
      ? customParticipants.map(p => p.name)
      : defaultParticipants.map(p => p.name);

  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
  ];

  const handleSaveParticipants = (participants: Participant[]) => {
    setCustomParticipants(participants);
  };

  const triggerSpin = (duration: number, randomRotation: number, winnerName: string) => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    Animated.timing(spinValue, {
      toValue: randomRotation,
      duration: duration,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(async () => {
        setWinner(winnerName);
        setIsSpinning(false);

        // Check if current user is the winner
        const winnerMember = membersSource.find((m: any) => m.name === winnerName);
        if (winnerMember && user && winnerMember.id === user.id) {
          // Trigger confetti for winner
          confettiRef.current?.start();

          // Animate celebration
          celebrationScale.setValue(0);
          Animated.spring(celebrationScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }

        // Auto-confirm winner in background (admin only)
        if (isAdmin && winnerMember) {
          const existingWinners = group.winners || [];
          const newWinners = [
            ...existingWinners,
            { month: currentMonth, memberId: winnerMember.id },
          ];
          try {
            await kuriService.updateWinners(groupId, newWinners);
            console.log('Winner confirmed successfully');
          } catch (error: any) {
            console.error('Failed to confirm winner:', error);
          }
        }
      }, 1000);
    });
  };

  const createWheelPath = (startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = CENTER + RADIUS * Math.cos(startAngleRad);
    const y1 = CENTER + RADIUS * Math.sin(startAngleRad);
    const x2 = CENTER + RADIUS * Math.cos(endAngleRad);
    const y2 = CENTER + RADIUS * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (angle: number) => {
    const textRadius = RADIUS * 0.7;
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: CENTER + textRadius * Math.cos(angleRad),
      y: CENTER + textRadius * Math.sin(angleRad),
    };
  };

  const spinWheel = async () => {
    if (isSpinning || wheelNames.length === 0) return;

    // Generate exact spin parameters
    const duration = Math.floor(Math.random() * 7000) + 3000; // 3000-10000ms
    const rotations = Math.floor(Math.random() * 3) + 5; // 5-7 rotations
    const randomAngle = Math.random() * 360;
    const randomRotation = rotations * 360 + randomAngle;

    // Calculate winner based on final angle (right pointer at 0 degrees)
    const anglePerSection = 360 / wheelNames.length;
    const pointerAngle = (360 - randomAngle) % 360; // Right position is at 0 degrees
    const winnerIndex = Math.floor(pointerAngle / anglePerSection) % wheelNames.length;
    const winnerName = wheelNames[winnerIndex];
    const winnerMember = membersSource.find((m: any) => m.name === winnerName);

    if (!winnerMember) return;

    console.log('[Admin] Sending spin - duration:', duration, 'randomRotation:', randomRotation, 'winner:', winnerMember.id);

    // Send exact spin data to backend
    try {
      await spinnerService.sendSpin(groupId, {
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        speed: duration,
        rotates: randomRotation,
        winner: winnerMember.id,
        adminId: group.adminId,
      });
    } catch (error) {
      console.error('Failed to broadcast spin:', error);
      Alert.alert('Error', 'Failed to broadcast spin');
      return;
    }

    // Trigger local animation with same exact parameters
    triggerSpin(duration, randomRotation, winnerName);
  };

  const getRadialText = (angle: number, label: string) => {
    const angleRad = (angle * Math.PI) / 180;

    // start near center
    const textRadius = RADIUS * 0.18;

    const x = CENTER + textRadius * Math.cos(angleRad);
    const y = CENTER + textRadius * Math.sin(angleRad);

    // keep text upright
    let rotation = angle;
    if (angle > 90 && angle < 270) {
      rotation = angle + 180;
    }

    return { x, y, rotation };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header with gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackArrowIcon width={20} height={20} fill={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Spin Wheel</Text>
            <Text style={styles.headerSubtitle}>{group.name}</Text>
            <Text style={styles.nextDrawText}>Next Draw: {getNextDrawDate()}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={styles.settingsButton}
          >
            <SettingsIcon width={20} height={20} fill={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Prize Card */}
        <Card style={styles.prizeCard}>
          <Text style={styles.prizeLabel}>Total Amount</Text>
          <Text style={styles.prizeAmount}>
            ₹{(parseInt(group.monthlyAmount) * membersSource.length).toLocaleString()}
          </Text>
          <Text style={styles.participantsCount}>
            {membersSource.length} Total Participants
          </Text>
        </Card>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!winner}
      >
        {/* Pending Users List
        <Card style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>Pending Users ({pendingMembers.length})</Text>
          <View style={styles.pendingList}>
            {pendingMembers.map((member: any, index: number) => (
              <View key={member.id} style={styles.pendingItem}>
                <View style={styles.pendingAvatar}>
                  <Text style={styles.pendingAvatarText}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.pendingName}>{member.name}</Text>
              </View>
            ))}
          </View>
        </Card> */}
        {/* Wheel Container */}
        {!winner && (
          <Card style={styles.wheelCard}>
            <View style={styles.wheelContainer}>
              <Animated.View
                style={[
                  styles.wheelWrapper,
                  {
                    transform: [
                      {
                        rotate: spinValue.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Svg
                  width={WHEEL_SIZE}
                  height={WHEEL_SIZE}
                  style={styles.wheel}
                >
                  {wheelNames.map((name, index) => {
                    const anglePerSection = 360 / wheelNames.length;
                    const startAngle = index * anglePerSection;
                    const endAngle = (index + 1) * anglePerSection;
                    const midAngle = startAngle + anglePerSection / 2;
                    const textPos = getTextPosition(midAngle);


                    return (
                      <React.Fragment key={index}>
                        <Path
                          d={createWheelPath(startAngle, endAngle)}
                          fill={colors[index % colors.length]}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <SvgText
                          x={textPos.x}
                          y={textPos.y}
                          fontSize="14"
                          fontWeight="600"
                          fill="white"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${midAngle} ${textPos.x} ${textPos.y})`}
                        >
                          {name}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}
                </Svg>
              </Animated.View>

              <View style={styles.centerCircle} />
              <View style={styles.pointer}>
                <View style={styles.triangle} />
              </View>
            </View>
          </Card>
        )}

        {/* Winner Display */}
        {winner && (
          <>
            {/* Check if current user is the winner */}
            {(() => {
              const winnerMember = membersSource.find((m: any) => m.name === winner);
              const isCurrentUserWinner = winnerMember && user && winnerMember.id === user.id;

              return isCurrentUserWinner ? (
                // Winner UI - Current user won
                <Animated.View style={{ transform: [{ scale: celebrationScale }] }}>
                  <Card style={styles.winnerCard}>
                    <Text style={styles.winnerEmoji}>🎉</Text>
                    <Text style={styles.winnerText}>Congratulations!</Text>
                    <Text style={styles.winnerName}>You are the Winner!</Text>
                    <Text style={styles.winnerSubtext}>
                      You've won ₹{(parseInt(group.monthlyAmount) * membersSource.length).toLocaleString()} this month!
                    </Text>
                  </Card>
                </Animated.View>
              ) : (
                // Non-winner UI - Someone else won
                <Card style={styles.nonWinnerCard}>
                  <Text style={styles.nonWinnerEmoji}>🎯</Text>
                  <Text style={styles.nonWinnerTitle}>Winner Announced!</Text>
                  <Text style={styles.actualWinnerName}>{winner}</Text>
                  <Text style={styles.nonWinnerMessage}>
                    Better luck next time! Keep trying — your turn is coming soon!
                  </Text>
                </Card>
              );
            })()}
          </>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {!winner ? (
            isAdmin && (
              <Button
                title={isSpinning ? 'Spinning...' : 'Spin Now!'}
                onPress={spinWheel}
                disabled={isSpinning || wheelNames.length === 0 || !canSpinNow()}
                style={styles.spinButton}
                size="large"
              />
            )
          ) : (
            <Button
              title="Back to Home"
              onPress={() => navigation.goBack()}
              style={styles.spinButton}
              size="large"
            />
          )}
        </View>
      </ScrollView>

      {/* Participants Modal */}
      <ParticipantsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        participants={
          customParticipants.length > 0
            ? customParticipants
            : defaultParticipants
        }
        onSave={handleSaveParticipants}
      />

      {/* Confetti Cannon */}
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: width / 2, y: 0 }}
        autoStart={false}
        fadeOut={true}
        explosionSpeed={350}
        fallSpeed={2500}
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
    backgroundColor: Colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: Spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: Colors.primaryLight,
  },
  nextDrawText: {
    ...Typography.caption,
    color: Colors.primaryLight,
    marginTop: Spacing.xs,
  },
  settingsButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  prizeCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  prizeLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  prizeAmount: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  participantsCount: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    marginTop: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  wheelCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wheelWrapper: {
    position: 'relative',
  },
  wheel: {},
  centerCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  pointer: {
    position: 'absolute',
    right: -10,
    top: '50%',
    marginTop: -15,
    zIndex: 10,
    transform: [{ rotate: '180deg' }],
  },
  triangle: {
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftWidth: 35,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.primary,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  wheelText: {
    // color: Colors.white,
    // fontSize: 14,
    // fontWeight: 'bold',
    // textAlign: 'left'
    // width: 50,
  },
  winnerCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  winnerEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  winnerText: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  winnerName: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  winnerSubtext: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nonWinnerCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  nonWinnerEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  nonWinnerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  actualWinnerName: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  nonWinnerMessage: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    marginBottom: Spacing.xl,
  },
  spinButton: {
    marginBottom: Spacing.md,
  },
  winnerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  pendingCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  pendingTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  pendingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  pendingItem: {
    alignItems: 'center',
    width: (width - Spacing.lg * 2 - Spacing.md * 3) / 4,
  },
  pendingAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  pendingAvatarText: {
    ...Typography.h4,
    color: Colors.white,
  },
  pendingName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
