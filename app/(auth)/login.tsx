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
    StatusBar,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "@/services/authService";
import { Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
// @ts-ignore
import videoFile from "../../assets/vidios/PinDown.io_@kamkumarasinghe_1756743322.mp4";

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const handleLogin = async () => {
        if (isLoading) return;

        if (!email || !password) {
            Alert.alert("Missing Information", "Please fill in all fields");
            return;
        }

        setIsLoading(true);

        try {
            const user = await login(email, password);
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (userData?.role === "admin") {
                router.push("/adminComporents/AdminDashBoard");
            } else {
                router.push("/(tabs)/Home");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Login Failed", "Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Hero Section */}
                <View style={{ height: 380 }}>
                    <ImageBackground
                        source={{ uri: "https://i.pinimg.com/736x/d6/43/a5/d643a50abced773f9d2c543f9a3a9b56.jpg" }}
                        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.3)', 'rgba(34, 197, 94, 0.4)', 'rgba(0,0,0,0.6)']}
                        />

                        {/* Logo */}
                        <View style={{ alignItems: "center", zIndex: 10 }}>
                            <View style={{ width: 80, height: 80, backgroundColor: "white", borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
                                <Ionicons name="restaurant" size={32} color="#22c55e" />
                            </View>
                            <Text style={{ color: "white", fontSize: 36, fontWeight: "bold", textAlign: "center" }}>Welcome Back</Text>
                            <Text style={{ color: "white", fontSize: 36, fontWeight: "800", textAlign: "center" }}>TasteLanka</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                                <View style={{ width: 32, height: 1, backgroundColor: "#22c55e", marginRight: 8 }} />
                                <Text style={{ color: "#BBF7D0", fontSize: 18, fontWeight: "500" }}>SIGN IN</Text>
                                <View style={{ width: 32, height: 1, backgroundColor: "#22c55e", marginLeft: 8 }} />
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                {/* Form */}
                <View style={{ flex: 1, backgroundColor: "white", marginHorizontal: 16, marginTop: -32, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
                    {/* Email Input */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 4 }}>Email Address</Text>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderWidth: 2,
                            borderColor: isEmailFocused ? "#22c55e" : "#E5E7EB",
                            borderRadius: 16,
                            paddingHorizontal: 12
                        }}>
                            <Ionicons name="mail-outline" size={20} color={isEmailFocused ? "#22c55e" : "#9CA3AF"} />
                            <TextInput
                                placeholder="Enter your email"
                                style={{ flex: 1, marginLeft: 8, paddingVertical: 12, color: "#111827" }}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setIsEmailFocused(true)}
                                onBlur={() => setIsEmailFocused(false)}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 4 }}>Password</Text>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderWidth: 2,
                            borderColor: isPasswordFocused ? "#22c55e" : "#E5E7EB",
                            borderRadius: 16,
                            paddingHorizontal: 12
                        }}>
                            <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? "#22c55e" : "#9CA3AF"} />
                            <TextInput
                                placeholder="Enter your password"
                                style={{ flex: 1, marginLeft: 8, paddingVertical: 12, color: "#111827" }}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        style={{
                            borderRadius: 16,
                            overflow: "hidden",
                            marginVertical: 16,
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        <LinearGradient
                            colors={['#22c55e', '#16a34a', '#15803d']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ paddingVertical: 14, justifyContent: "center", alignItems: "center", borderRadius: 16 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>SIGN IN</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
