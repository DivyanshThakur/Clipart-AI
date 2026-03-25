import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { UploadDropzone } from '../components/home/UploadDropzone';
import { ImagePreview } from '../components/home/ImagePreview';
import { Button } from '../components/ui/Button';

export default function HomeScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleUpload = () => {
    // Mock upload for now
    setImageUri('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop');
  };

  const handleRemove = () => {
    setImageUri(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 bg-background">
        <View className="absolute left-0 right-0 top-0 z-10 h-20 flex-row items-center justify-between bg-background px-8">
          <View className="flex-row items-center gap-x-2">
            <View className="h-10 w-10 overflow-hidden rounded-lg">
              <Image
                source={require('../assets/images/icon.png')}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <Text className="font-bold text-xl leading-7 tracking-[-0.9px] text-on_surface">
              Clipart AI
            </Text>
          </View>
          <Pressable hitSlop={15} className="rounded-full active:opacity-60">
            <History color="#e5e2e1" strokeWidth={1.8} />
          </Pressable>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[576px] items-center">
            <View className="mb-10 items-center">
              <Text className="text-center font-semibold text-[36px] leading-10 tracking-[-0.9px] text-on_surface">
                Turn your photo
              </Text>
              <Text className="text-center font-semibold text-[36px] leading-10 tracking-[-0.9px] text-tertiary">
                into Cliparts
              </Text>
              {imageUri && (
                <Text className="mt-4 text-center text-sm font-medium text-secondary opacity-80">
                  Review your image before we begin the{"\n"}transformation.
                </Text>
              )}
            </View>

            <View className="w-full">
              {!imageUri ? (
                <UploadDropzone onPress={handleUpload} />
              ) : (
                <View className="w-full">
                  <ImagePreview uri={imageUri} onRemove={handleRemove} />
                  <Button
                    className="mt-10 w-full"
                    rightIcon={<ArrowRight size={20} color="#e5e2e1" />}
                    onPress={() => router.push('/style-selection')}
                  >
                    Continue
                  </Button>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

