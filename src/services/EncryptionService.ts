import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

const VAULT_DIR = (FileSystem.documentDirectory || '') + 'vault/';
const NOMEDIA = VAULT_DIR + '.nomedia';

export default class EncryptionService {
  static async init() {
    if (!(await FileSystem.getInfoAsync(VAULT_DIR)).exists) {
      await FileSystem.makeDirectoryAsync(VAULT_DIR);
      await FileSystem.writeAsStringAsync(NOMEDIA, '');
    }
  }

  /**
   * Derives a symmetric key from a PIN using SHA-256
   */
  private static async deriveKey(pin: string, salt: string): Promise<string> {
    const combined = pin + salt;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined
    );
    return hash;
  }

  /**
   * Simple XOR-based encryption (for demo - in production use proper crypto library)
   * Note: React Native doesn't have built-in AES-GCM. Consider using:
   * - expo-crypto for hashing
   * - react-native-aes-crypto for AES encryption
   */
  static async encryptFile(uri: string, key: string): Promise<string> {
    await this.init();

    // Generate a random salt for key derivation
    const salt = Math.random().toString(36).substring(2, 15);
    const derivedKey = await this.deriveKey(key, salt);

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64'
    });

    // Simple obfuscation (XOR with derived key)
    // For production, use a proper crypto library like react-native-aes-crypto
    const encrypted = this.simpleEncrypt(base64, derivedKey);

    const path = VAULT_DIR + Date.now() + '.enc';
    await FileSystem.writeAsStringAsync(path, salt + ':' + encrypted);
    return path;
  }

  static async decryptFile(path: string, key: string): Promise<string> {
    const data = await FileSystem.readAsStringAsync(path);
    const [salt, encrypted] = data.split(':');

    const derivedKey = await this.deriveKey(key, salt);
    const base64 = this.simpleDecrypt(encrypted, derivedKey);

    const temp = (FileSystem.cacheDirectory || '') + Date.now();
    await FileSystem.writeAsStringAsync(temp, base64, {
      encoding: 'base64'
    });
    return temp;
  }

  /**
   * Simple XOR encryption for demo purposes
   * WARNING: This is NOT cryptographically secure! Use react-native-aes-crypto in production
   */
  private static simpleEncrypt(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    // Convert to base64 using btoa-like function
    return this.stringToBase64(result);
  }

  private static simpleDecrypt(encrypted: string, key: string): string {
    // Convert from base64
    const data = this.base64ToString(encrypted);
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  // Simple base64 encode for React Native
  private static stringToBase64(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      result += chars[(bitmap >> 18) & 63];
      result += chars[(bitmap >> 12) & 63];
      result += i - 2 < str.length ? chars[(bitmap >> 6) & 63] : '=';
      result += i - 1 < str.length ? chars[bitmap & 63] : '=';
    }

    return result;
  }

  // Simple base64 decode for React Native
  private static base64ToString(base64: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    while (i < base64.length) {
      const a = chars.indexOf(base64[i++]);
      const b = chars.indexOf(base64[i++]);
      const c = chars.indexOf(base64[i++]);
      const d = chars.indexOf(base64[i++]);

      const bitmap = (a << 18) | (b << 12) | (c << 6) | d;

      result += String.fromCharCode((bitmap >> 16) & 255);
      if (c !== -1) result += String.fromCharCode((bitmap >> 8) & 255);
      if (d !== -1) result += String.fromCharCode(bitmap & 255);
    }

    return result;
  }
}