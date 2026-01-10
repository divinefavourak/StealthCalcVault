import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';
import { AppContext } from '../context/AppContext';

interface Props {
  value: string;
  onPress: (value: string) => void;
}

export default function CalcButton({ value, onPress }: Props) {
  const { colors } = useContext(AppContext);
  const isOperator = ['+', '-', '×', '÷', '='].includes(value);
  const isAction = ['AC', '+/-', '%'].includes(value);
  const isEquals = value === '='
  const isHistory = value === 'history';

  let backgroundColor = colors.buttonBg;
  let textColor = colors.buttonText;

  if (isAction) {
    backgroundColor = colors.operatorBg;
    textColor = colors.operatorText;
  } else if (isEquals) {
    backgroundColor = colors.accentBg;
    textColor = colors.accentText;
  } else if (isOperator) {
    if (colors.operatorBg) backgroundColor = colors.operatorBg;
    textColor = colors.accentBg;
  } else if (!isHistory) {
    backgroundColor = colors.buttonBg;
    textColor = colors.buttonText;
  }

  if (isHistory) {
    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'transparent', alignItems: 'flex-start', paddingLeft: 10 }]}
        onPress={() => onPress(value)}
      >
        <Text style={{ fontSize: 20 }}> </Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.button, styles.shadow, { backgroundColor: backgroundColor, borderRadius: 50 }]}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
    >
      <View style={[styles.innerContainer]}>
        <Text style={[styles.text, { color: textColor }]}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
  },
  shadow: {
    // IOS generic shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    // Android
    elevation: 3,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 28,
    fontWeight: '500',
  },
});