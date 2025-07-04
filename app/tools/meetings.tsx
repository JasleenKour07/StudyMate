import { Text, View } from "react-native";

 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Meetings Tool!
      </Text>
      <Text className="mt-4 text-gray-600">
        This is a placeholder for the Meetings tool. More features coming soon!
      </Text>
      <Text className="mt-2 text-gray-500">
        Use this space to manage your meetings, schedule events, and collaborate with your team.
      </Text>
      <Text className="mt-6 text-gray-400">
        Note: This is a basic implementation. Please customize it further as needed.
      </Text>
      <Text className="mt-2 text-gray-400">
        For more information, visit our documentation or contact support.
    </Text>
  </View>
);
}