import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onPress: (value: string) => void;
}

export default function CalcButton({ value, onPress }: Props) {
  const isOperator = ['+', '-', '*', '/', '='].includes(value);
  const isFunction = ['sin', 'cos', 'tan', 'log', 'sqrt'].includes(value);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOperator && styles.operator,
        isFunction && styles.function,
        value === 'AC' && styles.clear,
      ]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.text, isOperator && styles.operatorText]}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { flex: 1, justifyContent: 'center', alignItems: 'center', margin: 4, backgroundColor: '#333', borderRadius: 12 },
  operator: { backgroundColor: '#ff9500' },
  function: { backgroundColor: '#666' },
  clear: { backgroundColor: '#f00' },
  text: { fontSize: 24, color: '#fff' },
  operatorText: { color: '#fff' },
});