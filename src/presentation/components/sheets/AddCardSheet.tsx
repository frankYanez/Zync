import { NeonButton } from '@/presentation/components/ui/NeonButton';
import { NeonInput } from '@/presentation/components/ui/NeonInput';
import { ZyncTheme } from '@/shared/constants/theme';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface AddCardSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>;
    onAddCard: (cardData: any) => void;
}

export function AddCardSheet({ bottomSheetRef, onAddCard }: AddCardSheetProps) {
    // variables
    const snapPoints = useMemo(() => ['75%'], []);

    // Form state
    const [cardNumber, setCardNumber] = useState('');
    const [holderName, setHolderName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const handleSheetChanges = useCallback((index: number) => {
        // handle sheet changes
    }, []);

    const handleSubmit = () => {
        // Very basic validation mock
        if (cardNumber && holderName) {
            onAddCard({
                cardNumber,
                holderName,
                expiry,
                cvv
            });
            // Clear form
            setCardNumber('');
            setHolderName('');
            setExpiry('');
            setCvv('');
            bottomSheetRef.current?.close();
        }
    };

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose
            backgroundStyle={{ backgroundColor: '#111', borderWidth: 1, borderColor: ZyncTheme.colors.primary }}
            handleIndicatorStyle={{ backgroundColor: ZyncTheme.colors.primary }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.header}>
                    <NeonButton title="NEW PAYMENT METHOD" onPress={() => { }} variant="outline" style={{ borderStyle: 'dashed', borderWidth: 0 }} />
                </View>

                <View style={styles.form}>
                    <NeonInput
                        placeholder="Card Number"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        icon="card-outline"
                        keyboardType="numeric"
                        containerStyle={styles.input}
                    />

                    <NeonInput
                        placeholder="Card Holder Name"
                        value={holderName}
                        onChangeText={setHolderName}
                        icon="person-outline"
                        containerStyle={styles.input}
                    />

                    <View style={styles.row}>
                        <NeonInput
                            placeholder="MM/YY"
                            value={expiry}
                            onChangeText={setExpiry}
                            icon="calendar-outline"
                            containerStyle={[styles.input, { flex: 1, marginRight: 8 }]}
                        />
                        <NeonInput
                            placeholder="CVV"
                            value={cvv}
                            onChangeText={setCvv}
                            icon="lock-closed-outline"
                            keyboardType="numeric"
                            secureTextEntry
                            containerStyle={[styles.input, { flex: 1, marginLeft: 8 }]}
                        />
                    </View>

                    <NeonButton title="SAVE CARD" onPress={handleSubmit} style={styles.submitButton} />
                </View>

            </BottomSheetView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 24,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    form: {
        gap: 16,
    },
    input: {
        marginBottom: 0,
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        marginTop: 16,
    }
});
