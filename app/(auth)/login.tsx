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
                        uri: "https://i.pinimg.com/736x/af/0b/d2/af0bd27a3dce861d0dc32c06dab2b2cb.jpg",
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

            </View>

            {/* Form section */}
            <View className="flex-1 px-8 -mt-4">




                {/* Email Input */}
                <View className="mb-6">
                    <View className="absolute bottom-20 left-1">
                        <Text className="text-black text-3xl  mb-1">Sign in...</Text>
                    </View>

                    <Text className="text-gray-600 text-sm mb-2 ml-1 top-4">Email</Text>
                    <View className="border-b border-gray-200 pb-2">
                        <TextInput
                            placeholder="demo@email.com"
                            className="text-gray-800 text-base py-2 top-4"
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
                    <Text className="text-gray-600 text-sm mb-2 ml-1 top-2">Password</Text>
                    <View className="border-b border-gray-200 pb-2 top-2">
                        <TextInput
                            placeholder="Enter your password"
                            className="text-gray-800 text-base py-2 top-2"
                            placeholderTextColor="#C7C7CD"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </View>

                {/* Remember Me and Forgot Password */}
                <View className="flex-row justify-between items-center mb-8 top-4 top-4">
                    <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setRememberMe(!rememberMe)}
                    >
                        <View
                            className={`w-5 h-5 rounded border-2 mr-2 ${
                                rememberMe ? "bg-green-500 border-green-500" : "border-gray-300"
                            }`}
                        >
                            {rememberMe && (
                                <Text className="text-white text-xs text-center">✓</Text>
                            )}
                        </View>
                        <Text className="text-gray-600 text-sm ">Remember Me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text className="text-green-500 text-sm font-medium">
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    className="py-4 rounded-3xl mb-8 shadow-lg top-4"
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
                <View className="items-center mb-6 top-4">
                    <Text className="text-gray-500 text-sm mb-4">Or continue with</Text>

                    <View className="flex-row justify-center space-x-4 top-4  ">
                        {/* Google Login */}
                        <TouchableOpacity
                            className="w-14 h-14 rounded-full justify-center items-center right-5"
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
                                className="w-10 h-10"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        {/* Facebook Login */}
                        <TouchableOpacity
                            className="w-14 h-14 rounded-full justify-center items-center"
                            onPress={() => {
                                Alert.alert(
                                    "Facebook Login",
                                    "Facebook login functionality will be implemented here"
                                );
                            }}
                        >
                            <Image
                                source={{
                                    uri: "https://i.pinimg.com/1200x/5b/b0/f7/5bb0f73a7b3e0f976acad614a42e5040.jpg",
                                }}
                                className="w-10 h-10"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        {/* Twitter Login */}
                        <TouchableOpacity
                            className="w-14 h-14 rounded-full justify-center items-center"
                            onPress={() => {
                                Alert.alert(
                                    "Twitter Login",
                                    "Twitter login functionality will be implemented here"
                                );
                            }}
                        >
                            <Image
                                source={{
                                    uri: "https://i.pinimg.com/736x/98/0f/96/980f96304edcd0b16ed3b579d81c7a9e.jpg",
                                }}
                                className="w-13 h-13"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Register Link */}
                <View className="items-center top-5">
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
