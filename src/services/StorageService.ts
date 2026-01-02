import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const METADATA_KEY = '@vault_files';

export default class StorageService {
  static async getFiles() {
    const json = await AsyncStorage.getItem(METADATA_KEY);
    return json ? JSON.parse(json) : [];
  }

  static async addFile(name: string, type: string, encPath: string, originalUri?: string) {
    const files = await this.getFiles();
    files.push({ id: Date.now().toString(), name, type, encPath, originalUri });
    await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(files));
  }

  static async deleteFile(id: string) {
    const files = await this.getFiles();
    const file = files.find((f: any) => f.id === id);
    if (file && file.encPath) await FileSystem.deleteAsync(file.encPath, { idempotent: true });
    const updated = files.filter((f: any) => f.id !== id);
    await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(updated));
  }
}