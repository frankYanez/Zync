import { useZync } from '@/application/ZyncContext';
import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { ThemedText } from '@/presentation/components/themed-text';
import { CyberCard } from '@/presentation/components/ui/CyberCard';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { authState } = useZync();
  const balance = authState.user?.balance || 0;

  return (
    <ScreenLayout noPadding>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header Status */}
        <View style={styles.header}>
          <View style={styles.statusDot} />
          <ThemedText style={styles.statusText}>ESTÁS EN: CLUB VERTIGO</ThemedText>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <ThemedText style={styles.balanceAmount}>
            ${balance.toLocaleString()}
          </ThemedText>
          <ThemedText style={styles.balanceLabel}>Saldo Disponible</ThemedText>
        </View>

        {/* Scan Button - Central Feature */}
        <View style={styles.scanContainer}>
          <TouchableOpacity
            style={styles.scanButtonOuter}
            onPress={() => router.push('/scanner')}
          >
            <View style={styles.scanButtonInner}>
              <Ionicons name="scan-outline" size={48} color="#000" />
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.scanLabel}>ESCANEAR PARA PAGAR</ThemedText>
        </View>

        {/* Quick Access Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => router.push('/menu')} // Assuming menu is mapped or tab
          >
            <CyberCard style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="wine" size={24} color={ZyncTheme.colors.background} />
              </View>
              <View style={styles.cardContent}>
                <Ionicons name="arrow-forward" size={16} color={ZyncTheme.colors.textSecondary} style={{ alignSelf: 'flex-end' }} />
                <View style={{ flex: 1 }} />
                <ThemedText style={styles.cardTitle}>Menú{'\n'}del Bar</ThemedText>
              </View>
            </CyberCard>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => router.push('/beats')}
          >
            <CyberCard style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: ZyncTheme.colors.textSecondary }]}>
                <Ionicons name="musical-notes" size={24} color={ZyncTheme.colors.background} />
              </View>
              <View style={styles.cardContent}>
                <Ionicons name="arrow-forward" size={16} color={ZyncTheme.colors.textSecondary} style={{ alignSelf: 'flex-end' }} />
                <View style={{ flex: 1 }} />
                <ThemedText style={styles.cardTitle}>Zync{'\n'}Beats (DJ)</ThemedText>
              </View>
            </CyberCard>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ZyncTheme.spacing.xl,
    marginBottom: ZyncTheme.spacing.l,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ZyncTheme.colors.primary,
    marginRight: ZyncTheme.spacing.s,
  },
  statusText: {
    fontSize: ZyncTheme.typography.size.xs,
    letterSpacing: 1,
    color: ZyncTheme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  balanceContainer: {

    alignItems: 'center',
    marginBottom: ZyncTheme.spacing.xxl,
  },
  balanceAmount: {
    paddingTop: ZyncTheme.spacing.xl,
    fontSize: 56,
    fontFamily: ZyncTheme.typography.weight.extraBold, // Ensure font supports this or use bold
    fontWeight: '800',
    color: ZyncTheme.colors.primary,
    textShadowColor: 'rgba(204, 255, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  balanceLabel: {
    fontSize: ZyncTheme.typography.size.m,
    color: ZyncTheme.colors.textSecondary,
    marginTop: -ZyncTheme.spacing.s,
  },
  scanContainer: {
    alignItems: 'center',
    marginBottom: ZyncTheme.spacing.xxl,
  },
  scanButtonOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(204, 255, 0, 0.1)', // Outer glow
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ZyncTheme.spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  scanButtonInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: ZyncTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ZyncTheme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  scanLabel: {
    fontSize: ZyncTheme.typography.size.s,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: ZyncTheme.colors.primary,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: ZyncTheme.spacing.m,
    gap: ZyncTheme.spacing.m,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    height: 160,
    backgroundColor: '#1E1E1E',
    padding: ZyncTheme.spacing.m,
    justifyContent: 'space-between',
    borderRadius: ZyncTheme.borderRadius.l,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: ZyncTheme.typography.size.l,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});
