import React, { useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;
    onNavigate: (screen: string) => void;
}

export default function SideMenu({ visible, onClose, onNavigate }: Props) {
    const { colors, calcMode, setCalcMode, theme, toggleTheme } = useContext(AppContext);

    const menuItems = [
        { id: 'basic', label: 'Basic Calculator', icon: 'calculator', type: 'ion' },
        { id: 'scientific', label: 'Scientific', icon: 'calculator-variant', type: 'material' },
        { id: 'converter', label: 'Converter', icon: 'swap-horizontal', type: 'ion' },
    ];

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.menu, { backgroundColor: colors.background }]}>
                            <Text style={[styles.title, { color: colors.text }]}>Menu</Text>

                            {menuItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.item,
                                        calcMode === item.id && { backgroundColor: colors.operatorBg }
                                    ]}
                                    onPress={() => {
                                        setCalcMode(item.id as any);
                                        onClose();
                                    }}
                                >
                                    {item.type === 'ion' ? (
                                        <Ionicons name={item.icon as any} size={24} color={colors.text} style={{ marginRight: 15 }} />
                                    ) : (
                                        <MaterialCommunityIcons name={item.icon as any} size={24} color={colors.text} style={{ marginRight: 15 }} />
                                    )}
                                    <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}

                            <View style={styles.separator} />

                            <TouchableOpacity style={styles.item} onPress={toggleTheme}>
                                <Ionicons name={theme === 'light' ? "moon" : "sunny"} size={24} color={colors.text} style={{ marginRight: 15 }} />
                                <Text style={[styles.label, { color: colors.text }]}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menu: {
        width: '75%',
        height: '100%',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 5,
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 20,
        opacity: 0.3,
    }
});
