import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { register } from "@/services/authService";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";

const Register = () => {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Google login hook
    const { request, response, promptAsync, handleGoogleLogin } = useGoogleLogin();

    useEffect(() => {
        (async () => {
            if (Platform.OS !== "web") {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") console.log("Gallery permission not granted");
            }
        })();
    }, []);

    // Handle Google login response
    useEffect(() => {
        if (response?.type === "success") {
            (async () => {
                setIsLoading(true);
                const user = await handleGoogleLogin();
                setIsLoading(false);

                if (user) {
                    Alert.alert("Success", "Account created successfully!", [
                        { text: "OK", onPress: () => router.push("/(tabs)") },
                    ]);
                } else {
                    Alert.alert("Error", "Google sign-in failed");
                }
            })();
        }
    }, [response]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
            setProfilePic(result.assets[0].uri);
        }
    };

    const handleRegister = async () => {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Missing fields", "Please fill all required fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Invalid email", "Enter a valid email address");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak password", "Password should be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            let uploadedUrl: string | null = null;
            if (profilePic) {
                uploadedUrl = await uploadImageToCloudinary(profilePic);
            }

            await register(fullName.trim(), email.trim(), password, uploadedUrl || null);

            Alert.alert("Success", "Account created successfully!", [
                { text: "OK", onPress: () => router.push("...//(auth)/login") },
            ]);
        } catch (err: any) {
            Alert.alert("Registration failed", err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            await promptAsync();
        } catch (error) {
            Alert.alert("Error", "Failed to initiate Google sign-in");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join TasteLanka today!</Text>
                </View>

                {/* Google Sign Up Button */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignUp}
                    disabled={!request || isLoading}
                >
                    <Icon name="login" size={20} color="#4285F4" />
                    <Text style={styles.googleButtonText}>Sign up with Google</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.divider} />
                </View>

                {/* Profile Pic */}
                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
                        {profilePic ? (
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: profilePic }} style={styles.profileImage} />
                                <TouchableOpacity style={styles.removeButton} onPress={() => setProfilePic(null)}>
                                    <Icon name="close" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Icon name="add-a-photo" size={40} color="#9CA3AF" />
                                <Text style={styles.placeholderText}>Add Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.imageHint}>{profilePic ? "Tap to change" : "Optional - Add your photo"}</Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginLinkContainer}>
                    <Text style={styles.loginLinkText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                        <Text style={styles.loginLink}>Log in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    scrollContainer: { padding: 20 },
    header: { alignItems: "center", marginBottom: 30 },
    backButton: { position: "absolute", left: 0, top: 0 },
    title: { fontSize: 28, fontWeight: "bold" },
    subtitle: { fontSize: 16, color: "#6B7280" },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 10,
    },
    googleButtonText: {
        color: "#1F2937",
        fontWeight: "600",
        fontSize: 16,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    dividerText: {
        marginHorizontal: 10,
        color: "#9CA3AF",
        fontSize: 14,
    },
    profileSection: { alignItems: "center", marginBottom: 30 },
    imageContainer: { width: 120, height: 120, borderRadius: 60, overflow: "hidden" },
    imageWrapper: { width: "100%", height: "100%", position: "relative" },
    profileImage: { width: "100%", height: "100%" },
    removeButton: { position: "absolute", top: 8, right: 8, backgroundColor: "#EF4444", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center" },
    placeholderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6" },
    placeholderText: { color: "#9CA3AF" },
    imageHint: { color: "#6B7280", fontSize: 12, textAlign: "center", marginTop: 8 },
    formContainer: { marginBottom: 20 },
    textInput: { backgroundColor: "#fff", padding: 12, marginBottom: 16, borderRadius: 8 },
    registerButton: { backgroundColor: "#4CAF50", padding: 16, borderRadius: 12, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "bold" },
    loginLinkContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    loginLinkText: {
        color: "#6B7280",
        fontSize: 14,
    },
    loginLink: {
        color: "#4CAF50",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default Register;