import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';

interface Props {
  expression: string;
  result: string;
  isAuthMode?: boolean;
}

export default function Display({ expression, result, isAuthMode }: Props) {
  const { colors } = useContext(AppContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={[
          styles.expression,
          { color: isAuthMode ? '#4dff4d' : colors.displaySubtext },
        ]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {expression || (isAuthMode ? 'Enter PIN' : '')}
      </Text>
      <Text
        style={[
          styles.result,
          { color: isAuthMode ? '#4dff4d' : colors.text },
        ]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {result || (isAuthMode ? 'Locked' : '0')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 180,
  },
  expression: {
    fontSize: 28,
    marginBottom: 10,
    fontWeight: '300',
  },
  result: {
    fontSize: 64,
    fontWeight: '400',
  },
});