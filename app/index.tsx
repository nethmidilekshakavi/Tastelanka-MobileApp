import { Text, TouchableOpacity, View } from "react-native";
import "./../global.css"
import { useRouter } from "expo-router";

export default function Index() {

  const router = useRouter();
  
  return (
    <View className="flex-1 items-center justify-center bg-red-600">
      <Text className="text-white text-lg font-bold">
        Edit app/index.tsx to edit this screen.
      </Text>
      <TouchableOpacity onPress={() => router.push("/testing")}>
        <Text>
          change router
        </Text>
      </TouchableOpacity>
    </View>
  );
}
