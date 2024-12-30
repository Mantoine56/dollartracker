import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  ProgressBar,
  Button,
  IconButton,
  Card,
} from 'react-native-paper';
import { Screen, ScrollView } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  progress?: number;
}

interface Level {
  level: number;
  title: string;
  description: string;
  requiredPoints: number;
  icon: string;
}

const badges: Badge[] = [
  {
    id: '1',
    name: 'Budget Master',
    description: 'Stay within budget for 7 consecutive days',
    icon: 'shield-star',
    earned: true,
    earnedDate: new Date('2024-12-25'),
  },
  {
    id: '2',
    name: 'Savings Guru',
    description: 'Save 20% of your budget in a week',
    icon: 'piggy-bank',
    earned: true,
    earnedDate: new Date('2024-12-28'),
  },
  {
    id: '3',
    name: 'Tracking Pro',
    description: 'Log all transactions for 30 days straight',
    icon: 'chart-line',
    earned: false,
    progress: 0.7,
  },
  {
    id: '4',
    name: 'Category Expert',
    description: 'Use all spending categories in a month',
    icon: 'view-grid-plus',
    earned: false,
    progress: 0.4,
  },
];

const levels: Level[] = [
  { level: 1, title: 'Novice Saver', description: 'Start your saving journey', requiredPoints: 0, icon: 'seed' },
  { level: 2, title: 'Budget Scout', description: 'Master the basics of budgeting', requiredPoints: 100, icon: 'sprout' },
  { level: 3, title: 'Money Manager', description: 'Handle your finances like a pro', requiredPoints: 300, icon: 'tree' },
  { level: 4, title: 'Finance Wizard', description: 'Become a true financial expert', requiredPoints: 600, icon: 'forest' },
];

export default function IncentivesScreen() {
  const theme = useTheme();
  const width = Dimensions.get('window').width;
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  // Mock user data
  const userPoints = 250;
  const currentLevel = levels.find(level => level.requiredPoints <= userPoints);
  const nextLevel = levels.find(level => level.requiredPoints > userPoints);
  
  const progressToNextLevel = nextLevel
    ? (userPoints - currentLevel!.requiredPoints) / (nextLevel.requiredPoints - currentLevel!.requiredPoints)
    : 1;

  const renderBadgeCard = ({ item }: { item: Badge }) => (
    <Surface style={styles.badgeCard}>
      <View style={styles.badgeIconContainer}>
        <MaterialCommunityIcons
          name={item.icon as any}
          size={48}
          color={item.earned ? theme.colors.primary : theme.colors.outline}
        />
        {item.earned && (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={theme.colors.primary}
            style={styles.earnedIcon}
          />
        )}
      </View>
      <Text variant="titleMedium" style={styles.badgeName}>{item.name}</Text>
      <Text variant="bodyMedium" style={styles.badgeDescription}>{item.description}</Text>
      {item.earned ? (
        <Text variant="bodySmall" style={styles.earnedDate}>
          Earned on {item.earnedDate?.toLocaleDateString()}
        </Text>
      ) : (
        <View style={styles.progressContainer}>
          <ProgressBar progress={item.progress || 0} style={styles.progressBar} />
          <Text variant="bodySmall">{Math.round((item.progress || 0) * 100)}% Complete</Text>
        </View>
      )}
    </Surface>
  );

  return (
    <Screen>
      <ScrollView>
        {/* Level Progress Section */}
        <Surface style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <View style={styles.levelIconContainer}>
              <MaterialCommunityIcons
                name={currentLevel?.icon as any}
                size={36}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.levelInfo}>
              <Text variant="titleLarge">{currentLevel?.title}</Text>
              <Text variant="bodyMedium">{currentLevel?.description}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.pointsContainer}>
              <Text variant="titleMedium">{userPoints} Points</Text>
              {nextLevel && (
                <Text variant="bodyMedium">
                  {nextLevel.requiredPoints - userPoints} points to {nextLevel.title}
                </Text>
              )}
            </View>
            <ProgressBar
              progress={progressToNextLevel}
              style={styles.levelProgress}
            />
          </View>
        </Surface>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Badges</Text>
          <Carousel
            loop
            width={width - 32}
            height={240}
            data={badges}
            scrollAnimationDuration={1000}
            onSnapToItem={setCurrentBadgeIndex}
            renderItem={renderBadgeCard}
          />
          <View style={styles.pagination}>
            {badges.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentBadgeIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Achievements Summary */}
        <Surface style={styles.achievementsSummary}>
          <Text variant="titleMedium">Achievements Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">{badges.filter(b => b.earned).length}</Text>
              <Text variant="bodyMedium">Badges Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">{currentLevel?.level}</Text>
              <Text variant="bodyMedium">Current Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">{userPoints}</Text>
              <Text variant="bodyMedium">Total Points</Text>
            </View>
          </View>
        </Surface>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  levelSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  progressSection: {
    gap: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelProgress: {
    height: 8,
    borderRadius: 4,
  },
  badgesSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 16,
  },
  badgeCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  badgeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  earnedIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  badgeName: {
    textAlign: 'center',
  },
  badgeDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
  earnedDate: {
    opacity: 0.5,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  paginationDotActive: {
    backgroundColor: '#1E90FF',
    width: 24,
  },
  achievementsSummary: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
});
