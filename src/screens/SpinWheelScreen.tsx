import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Button, TextInput, IconButton } from 'react-native-paper';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { BackArrowIcon, SettingsIcon } from '../components/TabIcons';
import { RootState } from '../store';

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
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackArrowIcon width={20} height={20} fill="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎰 Spin Wheel</Text>
          <TouchableOpacity
            onPress={() => setShowCustomizer(!showCustomizer)}
            style={styles.customizeButton}
          >
            <SettingsIcon width={20} height={20} fill="white" />
          </TouchableOpacity>
        </View>

        {showCustomizer && (
          <Animatable.View animation="slideInDown" style={styles.customizer}>
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
                mode="contained"
                onPress={addCustomName}
                style={styles.addButton}
              >
                ➕
              </Button>
            </View>

            <View style={styles.namesList}>
              {customNames.map((name, index) => (
                <View key={index} style={styles.nameItem}>
                  <Text style={styles.nameText}>{name}</Text>
                  <TouchableOpacity onPress={() => deleteCustomName(name)}>
                    <Text style={styles.deleteIcon}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {customNames.length > 0 && (
              <Button
                mode="outlined"
                onPress={resetToOriginal}
                style={styles.resetButton}
              >
                Reset to Original
              </Button>
            )}
          </Animatable.View>
        )}

        <Animatable.View animation="fadeInDown" style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.prizeAmount}>
            Prize: ₹{(group.amount * group.members.length).toLocaleString()}
          </Text>
        </Animatable.View>

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

        {winner && (
          <Animatable.View animation="bounceIn" style={styles.winnerContainer}>
            <Text style={styles.winnerEmoji}>🎉</Text>
            <Text style={styles.winnerText}>Winner!</Text>
            <Text style={styles.winnerName}>{winner}</Text>
          </Animatable.View>
        )}

        <View style={styles.controls}>
          {!winner ? (
            <Button
              mode="contained"
              onPress={spinWheel}
              disabled={isSpinning || wheelNames.length === 0}
              style={styles.spinButton}
              contentStyle={styles.buttonContent}
            >
              {isSpinning ? 'Spinning...' : 'Spin Now! 🎰'}
            </Button>
          ) : (
            <View style={styles.winnerActions}>
              <Button
                mode="outlined"
                onPress={resetSpin}
                style={styles.actionButton}
              >
                Spin Again
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.actionButton}
              >
                Confirm Winner
              </Button>
            </View>
          )}
        </View>

        <Text style={styles.eligibleCount}>
          {wheelNames.length} names on wheel
        </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backIcon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  customizeButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  customizeIcon: {
    fontSize: 20,
  },
  customizer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  addNameContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    backgroundColor: 'white',
  },
  addButton: {
    alignSelf: 'center',
  },
  namesList: {
    maxHeight: 120,
  },
  nameItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 16,
    color: '#333',
  },
  deleteIcon: {
    fontSize: 16,
  },
  resetButton: {
    marginTop: 12,
  },
  groupInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  prizeAmount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
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
    backgroundColor: 'white',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    borderLeftColor: 'white',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  winnerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  winnerEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD700',
  },
  controls: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  spinButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonContent: {
    paddingVertical: 12,
  },
  winnerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  eligibleCount: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 40,
  },
});
