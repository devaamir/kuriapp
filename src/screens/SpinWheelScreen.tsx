import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { BackArrowIcon, SettingsIcon } from '../components/TabIcons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RootState } from '../store';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8;
const RADIUS = WHEEL_SIZE / 2;
const CENTER = RADIUS;

interface SpinWheelScreenProps {
  navigation: any;
  route: any;
}

export const SpinWheelScreen: React.FC<SpinWheelScreenProps> = ({
  navigation,
  route,
}) => {
  const { groupId } = route.params;
  const { groups } = useSelector((state: RootState) => state.app);
  const group = groups.find(g => g.id === groupId);

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [customNames, setCustomNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  if (!group) return null;

  const eligibleMembers = group.members.filter(m => m.hasPaid && !m.hasWon);
  const wheelNames =
    customNames.length > 0 ? customNames : eligibleMembers.map(m => m.name);
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

  const addCustomName = () => {
    if (newName.trim() && !customNames.includes(newName.trim())) {
      setCustomNames([...customNames, newName.trim()]);
      setNewName('');
    }
  };

  const deleteCustomName = (nameToDelete: string) => {
    setCustomNames(customNames.filter(name => name !== nameToDelete));
  };

  const resetToOriginal = () => {
    setCustomNames([]);
    setShowCustomizer(false);
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

  const spinWheel = () => {
    if (isSpinning || wheelNames.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const randomRotation = Math.random() * 360 + 1440;

    Animated.timing(spinValue, {
      toValue: randomRotation,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      // Calculate winner based on pointer position
      const normalizedRotation = randomRotation % 360;
      const pointerAngle = (360 - normalizedRotation + 0) % 360; // Pointer is at right (90°)
      const anglePerSection = 360 / wheelNames.length;
      const winnerIndex = Math.floor(pointerAngle / anglePerSection);

      setWinner(wheelNames[winnerIndex]);
      setIsSpinning(false);
    });
  };

  const resetSpin = () => {
    setWinner(null);
    spinValue.setValue(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header with gradient */}
      <LinearGradient colors={Colors.gradientPrimary} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackArrowIcon width={20} height={20} fill={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>🎰 Spin Wheel</Text>
            <Text style={styles.headerSubtitle}>{group.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCustomizer(!showCustomizer)}
            style={styles.settingsButton}
          >
            <SettingsIcon width={20} height={20} fill={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Prize Card */}
        <Card style={styles.prizeCard}>
          <Text style={styles.prizeLabel}>Prize Amount</Text>
          <Text style={styles.prizeAmount}>
            ₹{(group.amount * group.members.length).toLocaleString()}
          </Text>
          <Text style={styles.participantsCount}>
            {wheelNames.length} participants
          </Text>
        </Card>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customizer */}
        {showCustomizer && (
          <Card style={styles.customizerCard}>
            <Text style={styles.customizerTitle}>Customize Participants</Text>
            
            <View style={styles.addNameContainer}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Add name..."
                style={styles.nameInput}
                mode="outlined"
                dense
              />
              <Button
                title="Add"
                onPress={addCustomName}
                style={styles.addButton}
                size="small"
              />
            </View>

            {customNames.length > 0 && (
              <View style={styles.namesList}>
                {customNames.map((name, index) => (
                  <View key={index} style={styles.nameItem}>
                    <Text style={styles.nameText}>{name}</Text>
                    <TouchableOpacity onPress={() => deleteCustomName(name)}>
                      <Text style={styles.deleteIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <Button
                  title="Reset to Original"
                  onPress={resetToOriginal}
                  variant="outline"
                  style={styles.resetButton}
                />
              </View>
            )}
          </Card>
        )}

        {/* Wheel Container */}
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
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={styles.wheel}>
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

        {/* Winner Display */}
        {winner && (
          <Card style={styles.winnerCard}>
            <Text style={styles.winnerEmoji}>🎉</Text>
            <Text style={styles.winnerText}>Congratulations!</Text>
            <Text style={styles.winnerName}>{winner}</Text>
            <Text style={styles.winnerSubtext}>You are the lucky winner!</Text>
          </Card>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {!winner ? (
            <Button
              title={isSpinning ? 'Spinning...' : 'Spin Now! 🎰'}
              onPress={spinWheel}
              disabled={isSpinning || wheelNames.length === 0}
              style={styles.spinButton}
            />
          ) : (
            <View style={styles.winnerActions}>
              <Button
                title="Spin Again"
                onPress={resetSpin}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Confirm Winner"
                onPress={() => navigation.goBack()}
                style={styles.actionButton}
              />
            </View>
          )}
        </View>
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
  customizerCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  customizerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  addNameContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  addButton: {
    alignSelf: 'center',
  },
  namesList: {
    marginTop: Spacing.md,
  },
  nameItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  nameText: {
    ...Typography.body1,
    color: Colors.textPrimary,
  },
  deleteIcon: {
    ...Typography.body1,
    color: Colors.error,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: Spacing.md,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  pointer: {
    position: 'absolute',
    right: 42,
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
    borderLeftWidth: 30,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.white,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  winnerCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  winnerEmoji: {
    fontSize: 60,
    marginBottom: Spacing.lg,
  },
  winnerText: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  winnerName: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  winnerSubtext: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
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
});
