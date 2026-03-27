import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { useGenerationStore } from '../store/generationStore';

type ImageSource = 'camera' | 'gallery';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIN_IMAGE_EDGE = 512;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];

function getExtension(uri: string): string | null {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? null;
}

function isSupportedAsset(asset: ImagePicker.ImagePickerAsset): boolean {
  if (
    asset.mimeType &&
    ALLOWED_MIME_TYPES.includes(asset.mimeType.toLowerCase())
  ) {
    return true;
  }

  const extension = getExtension(asset.uri);
  return extension !== null && ALLOWED_EXTENSIONS.includes(extension);
}

function getResizeDimensions(
  width: number,
  height: number,
): { width: number; height: number } {
  const longestEdge = Math.max(width, height);

  if (longestEdge <= 1600) {
    return { width, height };
  }

  const scale = 1600 / longestEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function getSaveFormat(asset: ImagePicker.ImagePickerAsset): SaveFormat {
  const extension = getExtension(asset.uri);
  const mimeType = asset.mimeType?.toLowerCase();

  if (mimeType === 'image/png' || extension === 'png') {
    return SaveFormat.PNG;
  }

  return SaveFormat.JPEG;
}

async function requestPermission(source: ImageSource): Promise<boolean> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  return permission.granted;
}

export function useImagePicker() {
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const image = useGenerationStore((state) => state.imageUri);
  const setStoreImage = useGenerationStore((state) => state.setImage);
  const resetGeneration = useGenerationStore((state) => state.reset);

  const removeImage = () => {
    setError(null);
    resetGeneration();
  };

  const pickImage = async (source: ImageSource) => {
    setError(null);

    const granted = await requestPermission(source);
    if (!granted) {
      setError(
        source === 'camera'
          ? 'Camera permission is required.'
          : 'Photo library permission is required.',
      );
      return;
    }

    const launchPicker =
      source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const result = await launchPicker({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];

    if (!isSupportedAsset(asset)) {
      setStoreImage(null);
      setError('Only JPG and PNG images are supported.');
      return;
    }

    if (asset.width < MIN_IMAGE_EDGE || asset.height < MIN_IMAGE_EDGE) {
      setStoreImage(null);
      setError('Use a clear portrait that is at least 512x512 pixels.');
      return;
    }

    setCompressing(true);

    try {
      const targetFormat = getSaveFormat(asset);
      const manipulated = await manipulateAsync(
        asset.uri,
        [{ resize: getResizeDimensions(asset.width, asset.height) }],
        {
          compress: targetFormat === SaveFormat.PNG ? 1 : 0.92,
          format: targetFormat,
        },
      );

      const info = await FileSystem.getInfoAsync(manipulated.uri);

      if (!info.exists) {
        throw new Error('Compressed image is unavailable.');
      }

      if ((info.size ?? 0) > MAX_IMAGE_BYTES) {
        setStoreImage(null);
        setError('Image must stay under 5MB after processing.');
        return;
      }

      setStoreImage(manipulated.uri);
    } catch (pickerError) {
      setStoreImage(null);
      setError(
        pickerError instanceof Error
          ? pickerError.message
          : 'Unable to process the selected image.',
      );
    } finally {
      setCompressing(false);
    }
  };

  return {
    image,
    error,
    compressing,
    pickImage,
    removeImage,
  };
}
