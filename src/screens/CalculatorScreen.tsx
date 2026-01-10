import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Alert, BackHandler, StyleSheet, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { AppContext } from '../context/AppContext';
import Display from '../components/Display';
import CalcButton from '../components/CalcButton';
import OverlayCalc from '../components/OverlayCalc';
import SideMenu from '../components/SideMenu';
import HistoryView from '../components/HistoryView';
import Converter from '../components/Converter';
import AuthService from '../services/AuthService';
import { evaluate } from 'mathjs';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CalculatorScreen({ navigation }: any) {
  const {
    isVaultUnlocked,
    unlockVault,
    lockVault,
    isAuthMode,
    setAuthMode,
    wrongAttempts,
    setWrongAttempts,
    colors,
    theme,
    toggleTheme,
    addToHistory,
    calcMode,
    setCalcMode
  } = useContext(AppContext);

  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  // Animation for Mode Switcher
  const slideAnim = useRef(new Animated.Value(0)).current;
  const MODE_WIDTH = 50; // Approx width of icons
  const BASIC_WIDTH = 60; // Approx width of "Basic" text pill

  useEffect(() => {
    let targetValue = 0;
    if (calcMode === 'scientific') targetValue = 0;
    else if (calcMode === 'converter') targetValue = 1;
    else if (calcMode === 'basic') targetValue = 2; // Index logic

    Animated.timing(slideAnim, {
      toValue: targetValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [calcMode]);

  useEffect(() => {
    if (isVaultUnlocked) navigation.navigate('Vault');
  }, [isVaultUnlocked]);

  const handlePress = (value: string) => {
    if (value === 'AC') {
      setExpression('');
      setResult('');
    } else if (value === '=') {
      handleEquals();
    } else if (value === '+/-') {
      if (expression.startsWith('-')) {
        setExpression(expression.substring(1));
      } else {
        setExpression('-' + expression);
      }
    } else if (value === '%') {
      setExpression(prev => prev + '/100');
    } else if (value === 'history') {
      setHistoryVisible(true);
    } else {
      setExpression((prev) => prev + value);
    }
  };

  const handleEquals = async () => {
    if (isAuthMode) {
      const valid = await AuthService.validatePIN(expression);
      if (valid) {
        unlockVault();
        setAuthMode(false);
        setExpression('');
      } else {
        setWrongAttempts(wrongAttempts + 1);
        if (wrongAttempts >= 2) {
          Alert.alert('Error', 'Calculator crashed.', [
            { text: 'OK', onPress: () => BackHandler.exitApp() },
          ]);
        } else {
          setResult('Error : Restart Calculator');
        }
      }
      setExpression('');
      return;
    }

    try {
      const evalExpression = expression.replace('×', '*').replace('÷', '/');
      const res = evaluate(evalExpression);
      const resString = res.toString();
      setResult(resString);

      // Add to history
      if (expression && resString) {
        addToHistory(`${expression} = ${resString}`);
      }

    } catch {
      setResult('Error');
    }
  };

  const onLongPress = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.ACTIVE) {
      setAuthMode(true);
      setExpression('');
      setResult('');
    }
  };

  const onDoubleTap = async () => {
    if (await AuthService.hasBiometricEnabled()) {
      const success = await AuthService.authenticateBiometric();
      if (success) unlockVault();
    }
  };

  // Define Layouts
  const basicRows = [
    ['AC', '()', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['history', '0', '.', '='],
  ];

  const scientificRows = [
    ['AC', '()', '%', '÷'],
    ['sin', 'cos', 'tan', 'sqrt'], // Sci Row 1
    ['log', 'pi', '^', '!'],       // Sci Row 2
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['history', '0', '.', '='],
  ];

  const rows = calcMode === 'scientific' ? scientificRows : basicRows;

  // Render content based on mode
  const renderContent = () => {
    if (calcMode === 'converter') {
      return <Converter />;
    }

    return (
      <>
        <Display
          expression={
            isAuthMode ? '*'.repeat(expression.length) : expression
          }
          result={result}
          isAuthMode={isAuthMode}
        />

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.accentBg} onPress={() => setHistoryVisible(true)} />
            <MaterialCommunityIcons name="microphone-outline" size={20} color={colors.accentBg} />
          </View>
          <MaterialCommunityIcons name="backspace-outline" size={20} color={colors.accentBg} onPress={() => setExpression(prev => prev.slice(0, -1))} />
        </View>

        <View
          style={{ flex: calcMode === 'scientific' ? 2.2 : 1.5, padding: 10, justifyContent: 'space-evenly', backgroundColor: colors.background }}
        >
          {rows.map((row, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                flex: 1,
                marginBottom: 8,
                gap: 12
              }}
            >
              {row.map((v) => (
                <CalcButton key={v} value={v} onPress={handlePress} />
              ))}
            </View>
          ))}
        </View>
      </>
    )
  };

  // Interpolate translateX based on slideAnim (0, 1, 2)
  // Assuming simplified widths for demonstration.
  // Sci = 0, Conv = 1, Basic = 2
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [2, 48, 98] // Adjust these based on actual layout measurements
  });

  const pillWidth = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [42, 42, 60]
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <TapGestureHandler onHandlerStateChange={onDoubleTap} numberOfTaps={2}>
        <LongPressGestureHandler
          onHandlerStateChange={onLongPress}
          minDurationMs={800}
        >
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Ionicons name="menu-outline" size={28} color={isAuthMode ? '#4dff4d' : colors.text} />
              </TouchableOpacity>

              <View style={[styles.modeSwitch, { backgroundColor: colors.operatorBg }]}>
                {/* Animated Pill Background */}
                <Animated.View style={[
                  styles.activePill,
                  {
                    backgroundColor: colors.background,
                    transform: [{ translateX }],
                    width: pillWidth
                  }
                ]} />

                <TouchableOpacity style={styles.modeIcon} onPress={() => setCalcMode('scientific')}>
                  <MaterialCommunityIcons name="calculator-variant-outline" size={20} color={calcMode === 'scientific' ? colors.text : colors.displaySubtext} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modeIcon} onPress={() => setCalcMode('converter')}>
                  <Ionicons name="apps-outline" size={20} color={calcMode === 'converter' ? colors.text : colors.displaySubtext} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeIcon, { paddingHorizontal: 16 }]} // Extra padding for text
                  onPress={() => setCalcMode('basic')}>
                  <Text style={{ color: calcMode === 'basic' ? colors.text : colors.displaySubtext, fontSize: 12, fontWeight: '600' }}>Basic</Text>
                </TouchableOpacity>
              </View>

              <View style={{ width: 28 }} />
            </View>

            {renderContent()}

            <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} onNavigate={() => { }} />
            <HistoryView visible={historyVisible} onClose={() => setHistoryVisible(false)} onSelect={(expr) => setExpression(expr)} />

            {showOverlay && <OverlayCalc />}
          </View>
        </LongPressGestureHandler>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // Safe area filler roughly
  },
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    alignItems: 'center',
    position: 'relative', // Context for absolute pill
    height: 40,
  },
  activePill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  modeIcon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 2, // Icons above pill
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingBottom: 22,
  }
});