import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (expression: string) => void;
}

export default function HistoryView({ visible, onClose, onSelect }: Props) {
    const { history, colors, clearHistory } = useContext(AppContext);

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>History</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={history}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
                        const [expr, res] = item.split(' = ');
                        return (
                            <TouchableOpacity style={[styles.item, { borderBottomColor: colors.operatorBg }]} onPress={() => { onSelect(expr); onClose(); }}>
                                <Text style={[styles.expression, { color: colors.displaySubtext }]}>{expr}</Text>
                                <Text style={[styles.result, { color: colors.text }]}>= {res}</Text>
                            </TouchableOpacity>
                        )
                    }}
                    ListEmptyComponent={
                        <Text style={{ color: colors.displaySubtext, textAlign: 'center', marginTop: 50 }}>No History</Text>
                    }
                />

                {history.length > 0 && (
                    <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
                        <Text style={{ color: 'red', fontSize: 18 }}>Clear History</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    item: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        alignItems: 'flex-end',
    },
    expression: {
        fontSize: 18,
        marginBottom: 5,
    },
    result: {
        fontSize: 24,
        fontWeight: '600',
    },
    clearBtn: {
        alignItems: 'center',
        padding: 20,
        marginBottom: 20,
    }
});
