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
import { uploadImageToCloudinary } from "@/services/cloudinaryService"; // import cloudinary function

const Register = () => {
    const router = useRouter();

    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== "web") {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") console.log("Gallery permission not granted");
            }
        })();
    }, []);

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

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Invalid email", "Enter a valid email address");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak password", "Password should be at least 6 characters");
            return;
        }

        setIsLoadingReg(true);

        try {
            let uploadedUrl: string | null = null;
            if (profilePic) {
                uploadedUrl = await uploadImageToCloudinary(profilePic);
                if (!uploadedUrl) {
                    Alert.alert("Image upload failed", "Using default profile picture");
                }
            }

            const user = await register(
                fullName.trim(),
                email.trim(),
                password,
                uploadedUrl || null
            );

            Alert.alert("Success", "Account created successfully!", [
                { text: "OK", onPress: () => router.push("/(auth)/login") },
            ]);
        } catch (err: any) {
            console.error("Registration error:", err);
            Alert.alert("Registration failed", err.message || "Something went wrong");
        } finally {
            setIsLoadingReg(false);
        }
    };

    const removeProfilePic = () => setProfilePic(null);

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

                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
                        {profilePic ? (
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: profilePic }} style={styles.profileImage} />
                                <TouchableOpacity style={styles.removeButton} onPress={removeProfilePic}>
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
                    <Text style={styles.imageHint}>
                        {profilePic ? "Tap to change" : "Optional - Add your photo"}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your full name"
                            placeholderTextColor="#9CA3AF"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your email"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your password (min 6 characters)"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.registerButton, isLoadingReg && styles.disabledButton]}
                    onPress={handleRegister}
                    disabled={isLoadingReg}
                >
                    {isLoadingReg ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.buttonText}>Creating Account...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={styles.loginLink}>
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC", top: 50 },
    scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 30 },
    header: { alignItems: "center", paddingTop: 20, paddingBottom: 30 },
    backButton: { position: "absolute", left: 0, top: 20, padding: 10 },
    title: { fontSize: 28, fontWeight: "bold", color: "#1F2937", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#6B7280" },
    profileSection: { alignItems: "center", marginBottom: 30 },
    imageContainer: { width: 120, height: 120, borderRadius: 60, overflow: "hidden", marginBottom: 12 },
    imageWrapper: { width: "100%", height: "100%", position: "relative" },
    profileImage: { width: "100%", height: "100%" },
    removeButton: { position: "absolute", top: 8, right: 8, backgroundColor: "#EF4444", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center" },
    placeholderContainer: { width: "100%", height: "100%", backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#E5E7EB", borderStyle: "dashed" },
    placeholderText: { color: "#9CA3AF", fontSize: 14, marginTop: 8 },
    imageHint: { color: "#6B7280", fontSize: 12, textAlign: "center" },
    formContainer: { marginBottom: 30 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
    textInput: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#1F2937" },
    registerButton: { backgroundColor: "#4CAF50", paddingVertical: 16, borderRadius: 12, marginBottom: 20, shadowColor: "#4CAF50", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    disabledButton: { opacity: 0.7 },
    loadingContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center", marginLeft: 8 },
    loginLink: { alignItems: "center" },
    loginText: { color: "#6B7280", fontSize: 16 },
    loginTextBold: { color: "#4CAF50", fontWeight: "600" },
});

export default Register;
