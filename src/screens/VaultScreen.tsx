import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import * as DocumentPicker from 'expo-document-picker';
import EncryptionService from '../services/EncryptionService';
import StorageService from '../services/StorageService';
import AuthService from '../services/AuthService';

export default function VaultScreen({ navigation }: any) {
  const { lockVault } = useContext(AppContext);
  const [files, setFiles] = useState<any[]>([]);
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    (async () => {
      const pin = await AsyncStorage.getItem('vault_pin');
      if (!pin) {
        setSetupMode(true);
        return;
      }
      await EncryptionService.init();
      setFiles(await StorageService.getFiles());
    })();
  }, []);

  const addFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (res.assets && res.assets[0]) {
      const asset = res.assets[0];
      const encPath = await EncryptionService.encryptFile(asset.uri, 'dummy-key-placeholder'); // In real: derive from PIN
      await StorageService.addFile(asset.name || 'Unknown', asset.mimeType || '', encPath);
      setFiles(await StorageService.getFiles());
    }
  };

  if (setupMode) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: '#000', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 24 }}>Set your vault PIN (6+ digits)</Text>
        {/* Add PIN input logic here */}
        <Button title="Enable Biometric?" onPress={() => AuthService.enableBiometric(true)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
      <Button title="Add File" onPress={addFile} />
      <Button title="Lock Vault" onPress={lockVault} />
      <FlatList
        data={files}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, backgroundColor: '#222', marginVertical: 5 }}>
            <Text style={{ color: '#fff' }}>{item.name}</Text>
            <Button title="Delete" onPress={() => StorageService.deleteFile(item.id).then(() => setFiles(files.filter(f => f.id !== item.id)))} />
          </View>
        )}
      />
    </View>
  );
}