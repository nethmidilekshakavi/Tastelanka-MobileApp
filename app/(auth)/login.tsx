import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { login } from "@/services/authService"

const LoginScreen = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleLogin = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const user = await login(email, password)   // <-- await here
      console.log("Login success:", user)
      router.push("/(tabs)/home")
    } catch (err) {
      console.error(err)
      Alert.alert("Login failed", "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-100 justify-center p-4">
      <Text className="text-2xl font-bold mb-6 text-blue-600 text-center">
        Login to Task Manager
      </Text>
      <TextInput
        placeholder="Email"
        className="bg-surface border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        className="bg-surface border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded mt-2"
        onPress={handleLogin}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text className="text-center text-2xl text-white">Login</Text>
        )}
      </TouchableOpacity>
      <Pressable onPress={() => router.push("/register")}>
        <Text className="text-center text-blue-500 text-xl">
          Don't have an account? Register
        </Text>
      </Pressable>
    </View>
  )
}

export default LoginScreen
