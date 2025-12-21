import { useZync } from '@/application/ZyncContext';
import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { ThemedText } from '@/presentation/components/themed-text';
import { CyberCard } from '@/presentation/components/ui/CyberCard';
import { NeonButton } from '@/presentation/components/ui/NeonButton';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function WalletScreen() {
    const router = useRouter();
    const { updateBalance, authState } = useZync();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(20000);
    const [customAmount, setCustomAmount] = useState('');

    const amounts = [10000, 20000, 50000];

    const handleCharge = () => {
        const amount = selectedAmount || parseInt(customAmount) || 0;
        if (amount > 0) {
            updateBalance((authState.user?.balance || 0) + amount);
            router.back();
        }
    };

    return (
        <ScreenLayout style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>CARGAR SALDO</ThemedText>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                {/* Select Amount */}
                <ThemedText style={styles.sectionTitle}>SELECCIONA UN MONTO</ThemedText>
                <View style={styles.amountGrid}>
                    {amounts.map((amount) => {
                        const isSelected = selectedAmount === amount;
                        return (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.amountCard,
                                    isSelected && styles.amountCardSelected
                                ]}
                                onPress={() => {
                                    setSelectedAmount(amount);
                                    setCustomAmount('');
                                }}
                            >
                                <ThemedText style={[
                                    styles.amountText,
                                    isSelected && styles.amountTextSelected
                                ]}>
                                    ${amount / 1000}k
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Custom Amount */}
                <ThemedText style={styles.sectionTitle}>OTRO MONTO</ThemedText>
                <CyberCard style={styles.customAmountContainer}>
                    <ThemedText style={styles.currencySymbol}>$</ThemedText>
                    <TextInput
                        style={styles.customInput}
                        value={customAmount}
                        onChangeText={(text) => {
                            setCustomAmount(text);
                            setSelectedAmount(null);
                        }}
                        placeholder="0"
                        placeholderTextColor={ZyncTheme.colors.textSecondary}
                        keyboardType="numeric"
                    />
                </CyberCard>

                {/* Payment Method */}
                <ThemedText style={styles.sectionTitle}>MÉTODO DE PAGO</ThemedText>
                <CyberCard style={styles.paymentCard}>
                    <View style={styles.cardInfo}>
                        <View style={styles.cardIcon}>
                            <View style={styles.visaChip} />
                            <ThemedText style={{ fontSize: 10, fontWeight: 'bold', color: 'white', marginTop: 14 }}>VISA</ThemedText>
                        </View>
                        <View>
                            <ThemedText style={styles.cardTitle}>Visa ****4589</ThemedText>
                            <ThemedText style={styles.cardSubtitle}>Crédito • Banco de Chile</ThemedText>
                        </View>
                    </View>
                    <Ionicons name="pencil" size={20} color={ZyncTheme.colors.primary} />
                </CyberCard>
            </View>

            {/* Footer Action */}
            <View style={styles.footer}>
                <NeonButton
                    title="CARGAR AHORA"
                    onPress={handleCharge}
                    icon={<Ionicons name="flash" size={20} color="black" />}
                    textStyle={{ fontWeight: '900', fontSize: 18 }}
                />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: ZyncTheme.spacing.m,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: ZyncTheme.spacing.l,
    },
    backButton: {
        padding: ZyncTheme.spacing.s,
    },
    headerTitle: {
        fontSize: ZyncTheme.typography.size.l,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: ZyncTheme.typography.size.xs,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: ZyncTheme.spacing.m,
        marginTop: ZyncTheme.spacing.l,
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    amountGrid: {
        flexDirection: 'row',
        gap: ZyncTheme.spacing.m,
    },
    amountCard: {
        flex: 1,
        aspectRatio: 1,
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    amountCardSelected: {
        backgroundColor: ZyncTheme.colors.primary,
        borderColor: ZyncTheme.colors.primary,
    },
    amountText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: ZyncTheme.colors.text,
    },
    amountTextSelected: {
        color: '#000000',
    },
    customAmountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ZyncTheme.spacing.l,
        backgroundColor: ZyncTheme.colors.card, // Override CyberCard default usually same but ensuring specific style
    },
    currencySymbol: {
        fontSize: 32,
        color: ZyncTheme.colors.primary,
        marginRight: ZyncTheme.spacing.s,
        fontWeight: 'bold',
    },
    customInput: {
        flex: 1,
        fontSize: 32,
        color: ZyncTheme.colors.textSecondary, // "0" color when placeholder? 
        // Actual text color
        fontWeight: 'bold',
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ZyncTheme.spacing.m,
    },
    cardIcon: {
        width: 40,
        height: 26,
        backgroundColor: '#1a1a50',
        borderRadius: 4,
        padding: 2,
        alignItems: 'flex-end',
    },
    visaChip: {
        width: 6,
        height: 4,
        backgroundColor: '#f1c40f',
        borderRadius: 1,
        alignSelf: 'flex-start',
        marginBottom: 2,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: ZyncTheme.typography.size.m,
    },
    cardSubtitle: {
        fontSize: ZyncTheme.typography.size.xs,
        color: ZyncTheme.colors.textSecondary,
    },
    footer: {
        paddingVertical: ZyncTheme.spacing.m,
    }
});
