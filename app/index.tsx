import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';


export default function Index() {
  const router = useRouter();
  

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Loading with delay...
      </Text>
      <Text className="text-sm text-gray-500">
        Redirecting to Home in 500ms...
      </Text>
      
    </View>
  );
}
