import CryptoES from 'crypto-es';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

const VAULT_DIR = FileSystem.documentDirectory + 'vault/';
const NOMEDIA = VAULT_DIR + '.nomedia';

export default class EncryptionService {
  static async init() {
    if (!(await FileSystem.getInfoAsync(VAULT_DIR)).exists) {
      await FileSystem.makeDirectoryAsync(VAULT_DIR);
      await FileSystem.writeAsStringAsync(NOMEDIA, '');
    }
  }

  static async encryptFile(uri: string, key: string): Promise<string> {
    await this.init();
    const iv = CryptoES.lib.WordArray.random(12);
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const encrypted = CryptoES.AES.encrypt(base64, CryptoES.enc.Hex.parse(key), {
      iv,
      mode: CryptoES.mode.GCM,
    });
    const path = VAULT_DIR + Date.now() + '.enc';
    await FileSystem.writeAsStringAsync(path, iv.toString() + ':' + encrypted.toString());
    return path;
  }

  static async decryptFile(path: string, key: string): Promise<string> {
    const data = await FileSystem.readAsStringAsync(path);
    const [ivHex, ciphertext] = data.split(':');
    const decrypted = CryptoES.AES.decrypt(ciphertext, CryptoES.enc.Hex.parse(key), {
      iv: CryptoES.enc.Hex.parse(ivHex),
      mode: CryptoES.mode.GCM,
    });
    const temp = FileSystem.cacheDirectory + Date.now();
    await FileSystem.writeAsStringAsync(temp, decrypted.toString(CryptoES.enc.Base64), { encoding: FileSystem.EncodingType.Base64 });
    return temp;
  }
}