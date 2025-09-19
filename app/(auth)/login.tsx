import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    Alert,
    ActivityIndicator,
    Image,
    ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "@/services/authService";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

const LoginScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    const handleLogin = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const user = await login(email, password);
            console.log("Login success:", user);

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (userData?.role === "admin") {
                router.push("/adminComporents/AdminDashBoard");
            } else {
                router.push("/(tabs)/Home");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Login failed", "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Top curved section with background image */}
            <View className="relative h-96">
                <ImageBackground
                    source={{
                        uri: "https://i.pinimg.com/1200x/32/6f/7d/326f7dadb79758177b3ec7249a659c8d.jpg",
                    }}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                >
                    {/* Decorative curved shapes */}
                    <View
                        className="absolute top-20 right-0 w-40 h-40 rounded-full opacity-20"
                        style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                    />
                    <View
                        className="absolute top-32 left-10 w-24 h-24 rounded-full opacity-15"
                        style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
                    />
                    <View
                        className="absolute top-10 right-20 w-16 h-16 rounded-full opacity-25"
                        style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                    />

                    {/* Curved bottom border */}
                    <View
                        className="absolute bottom-0 left-0 right-0 h-20"
                        style={{
                            backgroundColor: "white",
                            borderTopLeftRadius: 40,
                            borderTopRightRadius: 40,
                        }}
                    />
                </ImageBackground>

                {/* Title text */}
                <View className="absolute bottom-24 left-8">
                    <Text className="text-white text-3xl font-bold mb-1">Sign in</Text>
                </View>
            </View>

            {/* Form section */}
            <View className="flex-1 px-8 -mt-4">
                {/* Email Input */}
                <View className="mb-6">
                    <Text className="text-gray-600 text-sm mb-2 ml-1">Email</Text>
                    <View className="border-b border-gray-200 pb-2">
                        <TextInput
                            placeholder="demo@email.com"
                            className="text-gray-800 text-base py-2"
                            placeholderTextColor="#C7C7CD"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                    <Text className="text-gray-600 text-sm mb-2 ml-1">Password</Text>
                    <View className="border-b border-gray-200 pb-2">
                        <TextInput
                            placeholder="Enter your password"
                            className="text-gray-800 text-base py-2"
                            placeholderTextColor="#C7C7CD"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </View>

                {/* Remember Me and Forgot Password */}
                <View className="flex-row justify-between items-center mb-8">
                    <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setRememberMe(!rememberMe)}
                    >
                        <View
                            className={`w-5 h-5 rounded border-2 mr-2 ${
                                rememberMe ? "bg-pink-400 border-pink-400" : "border-gray-300"
                            }`}
                        >
                            {rememberMe && (
                                <Text className="text-white text-xs text-center">✓</Text>
                            )}
                        </View>
                        <Text className="text-gray-600 text-sm">Remember Me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text className="text-green-500 text-sm font-medium">
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    className="py-4 rounded-3xl mb-8 shadow-lg"
                    style={{
                        backgroundColor: "#4CAF50",
                        shadowColor: "#4CAF50",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="large" />
                    ) : (
                        <Text className="text-center text-lg text-white font-semibold">
                            Login
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Social Login Section */}
                <View className="items-center mb-6">
                    <Text className="text-gray-500 text-sm mb-4">Or continue with</Text>

                    <View className="flex-row justify-center space-x-4">
                        {/* Google Login */}
                        <TouchableOpacity
                            className="w-14 h-14 rounded-full justify-center items-center bg-gray-100 border border-gray-200"
                            onPress={() => {
                                Alert.alert(
                                    "Google Login",
                                    "Google login functionality will be implemented here"
                                );
                            }}
                        >
                            <Image
                                source={{
                                    uri: "https://developers.google.com/identity/images/g-logo.png",
                                }}
                                className="w-6 h-6"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        {/* Facebook Login */}
                        <TouchableOpacity
                            className="w-14 h-14 rounded-full justify-center items-center bg-blue-600"
                            onPress={() => {
                                Alert.alert(
                                    "Facebook Login",
                                    "Facebook login functionality will be implemented here"
                                );
                            }}
                        >
                            <Text className="text-white text-xl font-bold">f</Text>
                        </TouchableOpacity>

                        {/* Twitter Login */}
                        <TouchableOpacity
                            className="w-14 h-14 rounded-full justify-center items-center bg-sky-500"
                            onPress={() => {
                                Alert.alert(
                                    "Twitter Login",
                                    "Twitter login functionality will be implemented here"
                                );
                            }}
                        >
                            <Image
                                source={{
                                    uri: "https://cdn-icons-png.flaticon.com/512/733/733579.png",
                                }}
                                className="w-6 h-6"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Register Link */}
                <View className="items-center">
                    <Pressable onPress={() => router.push("/register")}>
                        <Text className="text-gray-600 text-base">
                            Don't have an Account ?{" "}
                            <Text className="text-green-500 font-semibold">Sign up</Text>
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default LoginScreen;
