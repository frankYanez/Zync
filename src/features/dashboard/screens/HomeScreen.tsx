
import { NeonModal } from '@/components/NeonModal';
import { ScreenLayout } from '@/components/ScreenLayout';

import { ThemedText } from '@/components/themed-text';
import { useZync } from '@/context/ZyncContext';
import { useCart } from '@/features/wallet/context/CartContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import LiveOrderBanner from '../components/LiveOrderBanner';
import OrderStatusModal from '../components/OrderStatusModal';
import { PromotionsCarousel } from '../components/PromotionsCarousel';
import { QuickAccessCarousel } from '../components/QuickAccessCarousel';

export default function HomeScreen() {
  const router = useRouter();
  const { currentEstablishment } = useZync();
  const { activeOrders } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);

  const hasLiveDj = currentEstablishment?.currentDj?.isLive;


  return (
    <ScreenLayout noPadding>


      {/* VIDEO BACKGROUND */}
      {hasLiveDj && currentEstablishment?.video ? (
        <View style={StyleSheet.absoluteFill}>
          <Video
            source={{ uri: currentEstablishment.video }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000']}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* HEADER: Club Name & Status */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.clubBadge} onPress={() => setModalVisible(true)}>
            <View style={styles.statusDot} />
            <ThemedText style={styles.clubName}>
              {currentEstablishment ? currentEstablishment.name.toUpperCase() : 'SELECCIONAR LUGAR'}
            </ThemedText>
          </TouchableOpacity>
          <View style={styles.iconContainer}  >
            {/* ACTIVE ORDER BANNER */}
            {activeOrders && activeOrders.length > 0 && (
              <LiveOrderBanner
                count={activeOrders.length}
                onPress={() => setOrderModalVisible(true)}
              />
            )}

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bag-outline" size={20} color={ZyncTheme.colors.primary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* LIVE DJ SECTION */}
        {hasLiveDj && (
          <View style={styles.djContainer}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <ThemedText style={styles.liveText}>LIVE DJ SET</ThemedText>
            </View>
            <ThemedText style={styles.djName}>{currentEstablishment?.currentDj?.name}</ThemedText>
          </View>
        )}

        {/* PROMOTIONS CAROUSEL */}
        <View style={styles.promoSection}>
          <PromotionsCarousel />
        </View>

        {/* MAIN ACTION: SCAN */}
        <View style={styles.scanSection}>
          <MotiView
            from={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
              repeatReverse: false
            }}
            style={[styles.scanGlow]}
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/scanner')}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={48} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.scanLabel}>ESCANEAR PARA PAGAR</ThemedText>
        </View>

        {/* QUICK ACCESS CAROUSEL */}
        <QuickAccessCarousel />

      </ScrollView>

      <NeonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <OrderStatusModal
        visible={orderModalVisible}
        onClose={() => setOrderModalVisible(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 10, // Space for status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ZyncTheme.spacing.l,
    marginBottom: ZyncTheme.spacing.xl,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ZyncTheme.colors.primary,
    marginRight: 8,
  },
  clubName: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: 'white',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ZyncTheme.colors.primary,
  },
  djContainer: {
    alignItems: 'center',
    marginBottom: ZyncTheme.spacing.l,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ZyncTheme.colors.primary,
    marginRight: 6,
  },
  liveText: {
    color: ZyncTheme.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ZyncTheme.spacing.m,
  },
  djName: {
    paddingTop: ZyncTheme.spacing.l,
    alignItems: 'center',
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    // textShadowColor: 'rgba(0,0,0,0.5)',
    // textShadowOffset: { width: 0, height: 2 },
    // textShadowRadius: 10,
    letterSpacing: -1,
    textShadowColor: ZyncTheme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  promoSection: {
    marginBottom: ZyncTheme.spacing.l,
  },
  scanSection: {
    alignItems: 'center',
    justifyContent: 'center',
    // marginVertical: ZyncTheme.spacing.l,
    height: 200,
  },
  scanButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ZyncTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    // Shadow/Glow
    shadowColor: ZyncTheme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  scanGlow: {
    position: 'absolute',
    top: 20,
    width: 120,
    height: 120,
    borderRadius: 80,
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    zIndex: 1,
  },
  scanLabel: {
    marginTop: 20,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: 'white',
    textTransform: 'uppercase',
  },
});
