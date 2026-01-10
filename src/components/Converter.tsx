import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { unit, format } from 'mathjs';

interface Props { }

const CONVERSION_TYPES = ['Currency', 'Length', 'Mass', 'Temperature'];

// Fallback rates if API fails or for testing
const MOCK_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.91,
    GBP: 0.78,
    JPY: 144.5,
    AUD: 1.5,
    CAD: 1.35,
};

const UNITS: Record<string, string[]> = {
    Length: ['m', 'ft', 'in', 'cm', 'km', 'mi'],
    Mass: ['kg', 'lb', 'oz', 'g'],
    Temperature: ['degC', 'degF', 'K'],
    Currency: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'], // Add more as needed
};

export default function Converter() {
    const { colors } = useContext(AppContext);
    const [type, setType] = useState('Currency');
    const [amount, setAmount] = useState('1');
    const [fromUnit, setFromUnit] = useState(UNITS['Currency'][0]);
    const [toUnit, setToUnit] = useState(UNITS['Currency'][1]);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [rates, setRates] = useState(MOCK_RATES);

    // Fetch rates on mount if Currency
    useEffect(() => {
        if (type === 'Currency') {
            fetchRates();
        }
    }, [type]);

    useEffect(() => {
        handleConvert();
    }, [amount, fromUnit, toUnit, type, rates]);

    // Update units when type changes
    useEffect(() => {
        setFromUnit(UNITS[type][0]);
        setToUnit(UNITS[type][1]);
    }, [type]);

    const fetchRates = async () => {
        setLoading(true);
        try {
            // Using frankfurter.app for free rates (checking against base EUR usually, but let's try generic)
            // Actually frankfurter is great. Base USD.
            const response = await fetch('https://api.frankfurter.app/latest?from=USD');
            const data = await response.json();
            if (data && data.rates) {
                setRates({ USD: 1, ...data.rates });
            }
        } catch (e) {
            console.log('Error fetching rates, using mock', e);
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = () => {
        if (!amount || isNaN(Number(amount))) {
            setResult('---');
            return;
        }

        const val = parseFloat(amount);

        if (type === 'Currency') {
            const fromRate = rates[fromUnit] || 1;
            const toRate = rates[toUnit] || 1;
            // output = input * (toRate / fromRate)
            const converted = val * (toRate / fromRate);
            setResult(converted.toFixed(4));
        } else {
            try {
                // Use mathjs for units
                // mathjs unit format: unit(value, unitName).toNumber(toUnitName)
                const converted = unit(val, fromUnit).toNumber(toUnit);
                setResult(format(converted, { precision: 4 }));
            } catch (e) {
                setResult('Error');
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Type Selector */}
            <View style={styles.typeContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {CONVERSION_TYPES.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.typeChip, type === t && { backgroundColor: colors.accentBg }]}
                            onPress={() => setType(t)}
                        >
                            <Text style={[styles.typeText, type === t ? { color: '#fff' } : { color: colors.text }]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.conversionBox}>
                {/* Input */}
                <View style={[styles.row, { borderBottomColor: colors.operatorBg, borderBottomWidth: 1 }]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.displaySubtext}
                    />
                    <Text style={{ color: colors.text, fontSize: 18, marginRight: 10 }}>{fromUnit}</Text>
                </View>

                {/* Result */}
                <View style={styles.row}>
                    <Text style={[styles.input, { color: colors.text }]} numberOfLines={1}>{result}</Text>
                    <Text style={{ color: colors.text, fontSize: 18, marginRight: 10 }}>{toUnit}</Text>
                </View>
            </View>

            {/* Unit Pickers - Simplified as list for now since RN Picker can be finicky without native module */}
            {/* For simplicity in this demo, just toggle through units or basic UI */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ color: colors.displaySubtext, marginBottom: 5 }}>From</Text>
                    <ScrollView style={{ height: 200, backgroundColor: colors.operatorBg, borderRadius: 10 }}>
                        {UNITS[type].map(u => (
                            <TouchableOpacity key={u} style={{ padding: 15 }} onPress={() => setFromUnit(u)}>
                                <Text style={{ color: u === fromUnit ? colors.accentBg : colors.text, fontWeight: u === fromUnit ? 'bold' : 'normal' }}>{u}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: colors.displaySubtext, marginBottom: 5 }}>To</Text>
                    <ScrollView style={{ height: 200, backgroundColor: colors.operatorBg, borderRadius: 10 }}>
                        {UNITS[type].map(u => (
                            <TouchableOpacity key={u} style={{ padding: 15 }} onPress={() => setToUnit(u)}>
                                <Text style={{ color: u === toUnit ? colors.accentBg : colors.text, fontWeight: u === toUnit ? 'bold' : 'normal' }}>{u}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {loading && <ActivityIndicator size="small" color={colors.accentBg} style={{ marginTop: 20 }} />}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    typeContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingHorizontal: 10,
        height: 50,
    },
    typeChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#333'
    },
    typeText: {
        fontWeight: '600',
    },
    conversionBox: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    input: {
        fontSize: 40,
        flex: 1,
    }
});
