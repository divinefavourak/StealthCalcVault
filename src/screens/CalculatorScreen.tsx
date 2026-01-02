import React, { useContext, useState, useEffect } from 'react';
import { View, Alert, BackHandler } from 'react-native';
import { GestureHandlerRootView, LongPressGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import { AppContext } from '../context/AppContext';
import Display from '../components/Display';
import CalcButton from '../components/CalcButton';
import OverlayCalc from '../components/OverlayCalc';
import AuthService from '../services/AuthService';
import { evaluate } from 'mathjs';

export default function CalculatorScreen({ navigation }: any) {
  const { isVaultUnlocked, unlockVault, lockVault, isAuthMode, setAuthMode, wrongAttempts, setWrongAttempts } = useContext(AppContext);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isVaultUnlocked) navigation.navigate('Vault');
  }, [isVaultUnlocked]);

  const handlePress = (value: string) => {
    if (value === 'AC') {
      setExpression('');
      setResult('');
    } else if (value === '=') {
      handleEquals();
    } else {
      setExpression(prev => prev + value);
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
          Alert.alert('Error', 'Calculator crashed.', [{ text: 'OK', onPress: () => BackHandler.exitApp() }]);
        } else {
          setResult('Error');
        }
      }
      setExpression('');
      return;
    }

    try {
      const res = evaluate(expression);
      setResult(res.toString());
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

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <TapGestureHandler onHandlerStateChange={onDoubleTap} numberOfTaps={2}>
        <LongPressGestureHandler onHandlerStateChange={onLongPress} minDurationMs={800}>
          <View style={{ flex: 1 }}>
            <Display expression={expression} result={result} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 10 }}>
              {['AC', '(', ')', '/', 'sin', '7', '8', '9', '*', 'cos', '4', '5', '6', '-', 'tan', '1', '2', '3', '+', 'log', '0', '.', '=', 'sqrt'].map(v => (
                <CalcButton key={v} value={v} onPress={handlePress} />
              ))}
            </View>
            {showOverlay && <OverlayCalc />}
          </View>
        </LongPressGestureHandler>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
}