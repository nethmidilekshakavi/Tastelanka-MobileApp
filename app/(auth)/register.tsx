// app/register.tsx
import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { register } from "@/services/authService";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Register = () => {
    const router = useRouter();

    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);

    // Pick image from library
    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                if (result.assets && result.assets.length > 0) {
                    setProfilePic(result.assets[0].uri);
                } else {
                    Alert.alert("Error", "No image selected. Try again.");
                }
            }
        } catch (error) {
            console.error("Image pick error:", error);
            Alert.alert("Error", "Something went wrong while picking the image");
        }
    };

    // Convert URI to blob
    const uriToBlob = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    };

    // Register user
    const handleRegister = async () => {
        if (!fullName || !email || !password) {
            Alert.alert("Missing fields", "Please fill all the fields");
            return;
        }

        if (isLoadingReg) return;
        setIsLoadingReg(true);

        try {
            let photoURL = null;

            // Upload profile pic if selected
            if (profilePic) {
                const blob = await uriToBlob(profilePic);
                const storage = getStorage();
                const storageRef = ref(storage, `profilePics/${Date.now()}.jpg`);
                await uploadBytes(storageRef, blob);
                photoURL = await getDownloadURL(storageRef); // Safe Firebase URL
            }

            // Call your register function (Auth + Firestore)
            const user = await register(fullName, email, password, photoURL);
            console.log("Register success:", user);
            Alert.alert("Success", "User registered successfully!");
            router.push("/(auth)/login");
        } catch (err: any) {
            console.error(err);
            Alert.alert("Registration failed", err.message || "Something went wrong");
        } finally {
            setIsLoadingReg(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-100 justify-center p-4">
            <Text className="text-2xl font-bold mb-6 text-blue-600 text-center">
                Register
            </Text>

            {/* Full Name */}
            <TextInput
                placeholder="Full Name"
                className="bg-white border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
            />

            {/* Email */}
            <TextInput
                placeholder="Email"
                className="bg-white border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            {/* Password */}
            <TextInput
                placeholder="Password"
                className="bg-white border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {/* Profile Picture */}
            <TouchableOpacity
                className="bg-gray-300 p-3 rounded mb-4"
                onPress={handlePickImage}
            >
                <Text className="text-center text-gray-800">
                    {profilePic
                        ? "Change Profile Picture"
                        : "Pick Profile Picture (optional)"}
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
                {isLoadingReg ? (
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
