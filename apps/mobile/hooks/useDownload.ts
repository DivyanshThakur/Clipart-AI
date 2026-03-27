import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import type { StyleResult } from '../types';

function sanitizeFileName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function getTargetUri(fileName: string): string {
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

  if (!baseDirectory) {
    throw new Error('File system is not available on this device.');
  }

  return `${baseDirectory}${fileName}`;
}

function isLocalFileUri(uri: string): boolean {
  return uri.startsWith('file://');
}

async function ensureMediaPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    Alert.alert('Unsupported', 'Saving to the gallery is only available on iOS and Android.');
    return false;
  }

  const permission = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Please allow photo library access to save images.');
    return false;
  }

  return true;
}

async function downloadToCache(url: string, fileName: string): Promise<string> {
  if (isLocalFileUri(url)) {
    return url;
  }

  const result = await FileSystem.downloadAsync(url, getTargetUri(fileName));
  return result.uri;
}

export function useDownload() {
  const downloadImage = async (url: string, styleName: string) => {
    try {
      const permitted = await ensureMediaPermission();
      if (!permitted) {
        return;
      }

      const fileUri = await downloadToCache(url, `${sanitizeFileName(styleName)}-${Date.now()}.png`);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('Saved', `${styleName} was added to your gallery.`);
    } catch (error) {
      Alert.alert('Download failed', error instanceof Error ? error.message : 'Unable to save the image.');
    }
  };

  const downloadAll = async (results: StyleResult[]) => {
    const successfulResults = results.filter(
      (result): result is StyleResult & { outputUrl: string } => result.status === 'success' && !!result.outputUrl
    );

    if (successfulResults.length === 0) {
      Alert.alert('Nothing to download', 'No generated images are ready yet.');
      return;
    }

    const permitted = await ensureMediaPermission();
    if (!permitted) {
      return;
    }

    let failures = 0;

    for (const result of successfulResults) {
      try {
        const fileUri = await downloadToCache(
          result.outputUrl,
          `${sanitizeFileName(result.style)}-${Date.now()}.png`
        );
        await MediaLibrary.saveToLibraryAsync(fileUri);
      } catch {
        failures += 1;
      }
    }

    if (failures === 0) {
      Alert.alert('Saved', 'All generated images were added to your gallery.');
      return;
    }

    Alert.alert('Partial download', `${successfulResults.length - failures} images saved, ${failures} failed.`);
  };

  const shareImage = async (url: string) => {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Unsupported', 'Sharing is not available on this device.');
        return;
      }

      const fileUri = await downloadToCache(url, `clipart-share-${Date.now()}.png`);
      await Sharing.shareAsync(fileUri, {
        dialogTitle: 'Share your clipart',
        mimeType: 'image/png',
      });
    } catch (error) {
      Alert.alert('Share failed', error instanceof Error ? error.message : 'Unable to share this image.');
    }
  };

  return {
    downloadImage,
    downloadAll,
    shareImage,
  };
}
