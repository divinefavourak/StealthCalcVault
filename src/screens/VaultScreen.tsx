import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';
import * as DocumentPicker from 'expo-document-picker';
import EncryptionService from '../services/EncryptionService';
import StorageService from '../services/StorageService';
import AuthService from '../services/AuthService';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = width / COLUMN_COUNT - 4; // 2px margin on each side

const CATEGORIES = ['All', 'Photos', 'Videos', 'Documents'];

export default function VaultScreen({ navigation }: any) {
  const { lockVault } = useContext(AppContext);
  const [files, setFiles] = useState<any[]>([]);
  const [setupMode, setSetupMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const pin = await AsyncStorage.getItem('vault_pin');
      if (!pin) {
        setSetupMode(true);
        return;
      }
      await EncryptionService.init();
      loadFiles();
    })();
  }, []);

  const loadFiles = async () => {
    const allFiles = await StorageService.getFiles();
    setFiles(allFiles);
  }

  const addFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (res.assets && res.assets[0]) {
      const asset = res.assets[0];
      try {
        // Determine generic type from mime
        // This is a naive check; real app should be more robust
        let type = 'Documents';
        if (asset.mimeType?.startsWith('image/')) type = 'Photos';
        else if (asset.mimeType?.startsWith('video/')) type = 'Videos';

        const encPath = await EncryptionService.encryptFile(asset.uri, 'dummy-key-placeholder');
        await StorageService.addFile(asset.name || 'Unknown', asset.mimeType || '', encPath); // You might want to save 'type' too in StorageService if you update the model
        loadFiles();
      } catch (e) {
        Alert.alert("Error", "Failed to add file to vault");
      }
    }
  };

  const getFilteredFiles = () => {
    if (selectedCategory === 'All') return files;
    // Naive filter implementation based on mimeType usually found in 'type' field of file object if we had it, 
    // or inferring from mimeType which we do have.
    return files.filter(f => {
      if (selectedCategory === 'Photos') return f.mimeType.startsWith('image/');
      if (selectedCategory === 'Videos') return f.mimeType.startsWith('video/');
      if (selectedCategory === 'Documents') return !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/');
      return true;
    });
  };

  const renderItem = ({ item }: any) => {
    const isImage = item.mimeType.startsWith('image/');

    return (
      <TouchableOpacity style={styles.gridItem} onLongPress={() => handleDelete(item)}>
        {isImage ? (
          // Ideally we'd show a thumbnail of the decrypted image, but for security/demo we'll use a placeholder or lock icon
          // In a real app complexity: Decrypt to temp cache -> Show -> Delete on unmount.
          // For this demo: Show a generic icon to represent the 'Stealth' aspect or a placeholder.
          <View style={[styles.thumbnail, { backgroundColor: '#333' }]}>
            <Ionicons name="image" size={30} color="#666" />
            <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
          </View>
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: '#333' }]}>
            <Ionicons name="document-text" size={30} color="#666" />
            <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      "Delete File",
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            await StorageService.deleteFile(item.id);
            loadFiles();
          }
        }
      ]
    )
  }

  if (setupMode) {
    return (
      <View style={{ flex: 1, padding: 20, paddingTop: insets.top, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="shield-checkmark-outline" size={80} color="#4B5EFC" style={{ marginBottom: 20 }} />
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Setup Vault</Text>
        <Text style={{ color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 30 }}>Set your PIN to secure your files.</Text>
        {/* Add PIN input logic here - Skipping for brevity as per instructions to focus on UI */}
        <TouchableOpacity style={styles.setupButton} onPress={() => AuthService.enableBiometric(true)}>
          <Text style={styles.setupButtonText}>Enable Biometric Security</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StealthVault</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.iconButton} onPress={addFile}>
            <Ionicons name="add" size={28} color="#4B5EFC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={lockVault}>
            <Ionicons name="lock-closed" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item && styles.selectedCategory]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryText, selectedCategory === item && styles.selectedCategoryText]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      {/* Grid */}
      <FlatList
        data={getFilteredFiles()}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={COLUMN_COUNT}
        columnWrapperStyle={{ gap: 4 }}
        contentContainerStyle={{ padding: 4, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={60} color="#333" />
            <Text style={{ color: '#666', marginTop: 10 }}>No files in this category</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconButton: {
    padding: 5,
    marginLeft: 15,
  },
  categoryContainer: {
    paddingVertical: 15,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1c1c1e',
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#4B5EFC',
  },
  categoryText: {
    color: '#8e8e93',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH, // Square
    marginBottom: 4,
  },
  thumbnail: {
    flex: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    color: '#fff',
    fontSize: 10,
    marginTop: 5,
    paddingHorizontal: 5,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  setupButton: {
    backgroundColor: '#4B5EFC',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  setupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});