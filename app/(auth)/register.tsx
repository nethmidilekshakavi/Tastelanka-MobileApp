import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { register } from "@/services/authService";

const Register = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPasword] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLodingReg, setIsLoadingReg] = useState<boolean>(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Missing fields", "Please fill all the fields");
      return;
    }

    if (isLodingReg) return;
    setIsLoadingReg(true);

    await register(fullName, email, password, profilePic)
      .then((res) => {
        console.log("Register success:", res);
        router.back();
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Registration failed", "Something went wrong");
      })
      .finally(() => {
        setIsLoadingReg(false);
      });
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center p-4">
      <Text className="text-2xl font-bold mb-6 text-blue-600 text-center">
        Register
      </Text>

      {/* Full Name */}
      <TextInput
        placeholder="Full Name"
        className="bg-surface border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
        placeholderTextColor="#9CA3AF"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Email */}
      <TextInput
        placeholder="Email"
        className="bg-surface border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password */}
      <TextInput
        placeholder="Password"
        className="bg-surface border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPasword}
      />

      {/* Profile Picture */}
      <TouchableOpacity
        className="bg-gray-300 p-3 rounded mb-4"
        onPress={handlePickImage}
      >
        <Text className="text-center text-gray-800">
          {profilePic ? "Change Profile Picture" : "Pick Profile Picture (optional)"}
        </Text>
      </TouchableOpacity>

      {profilePic && (
        <Image
          source={{ uri: profilePic }}
          className="w-24 h-24 rounded-full self-center mb-4"
        />
      )}

      {/* Register Button */}
      <TouchableOpacity
        className="bg-green-600 p-4 rounded mt-2"
        onPress={handleRegister}
      >
        {isLodingReg ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text className="text-center text-2xl text-white">Register</Text>
        )}
      </TouchableOpacity>

      {/* Back to Login */}
      <Pressable onPress={() => router.back()}>
        <Text className="text-center text-blue-500 text-xl mt-4">
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
};

export default Register;
