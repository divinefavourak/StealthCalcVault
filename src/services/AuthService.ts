import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = 'vault_pin';
const MASTER_KEY = 'master_key';
const BIO_ENABLED = 'bio_enabled';

export default class AuthService {
  static async validatePIN(input: string): Promise<boolean> {
    const stored = await AsyncStorage.getItem(PIN_KEY);
    if (!stored) {
      if (input.length >= 6) {
        await AsyncStorage.setItem(PIN_KEY, input);
        return true; // First-time setup
      }
      return false;
    }
    return input === stored;
  }

  static async hasBiometricEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(BIO_ENABLED);
    return enabled === 'true' && await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
  }

  static async authenticateBiometric(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock vault' });
    return result.success;
  }

  static async enableBiometric(enable: boolean) {
    await AsyncStorage.setItem(BIO_ENABLED, enable ? 'true' : 'false');
  }
}