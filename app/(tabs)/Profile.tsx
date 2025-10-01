import React, { useEffect, useState } from "react";
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
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { auth, db } from "@/config/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
    updatePassword as updateAuthPassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateProfile,
} from "firebase/auth";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react-native";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/davhloffd/image/upload";
const UPLOAD_PRESET = "my_upload_preset";
const DEFAULT_PROFILE_PIC = "https://via.placeholder.com/150/ccc/fff?text=User";

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { theme, toggleTheme, colors } = useTheme();
    const [userInfo, setUserInfo] = useState({
        fullName: "",
        email: "",
        photoURL: DEFAULT_PROFILE_PIC,
        joinDate: "",
    });

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    Alert.alert("Error", "No user logged in");
                    setLoading(false);
                    return;
                }

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const joinDate = userData.createdAt
                        ? new Date(userData.createdAt.toDate()).getFullYear()
                        : new Date().getFullYear();

                    const profileData = {
                        fullName: userData.fullName || "",
                        email: userData.email || user.email || "",
                        photoURL: userData.photoURL || user.photoURL || DEFAULT_PROFILE_PIC,
                        joinDate: `Joined in ${joinDate}`,
                    };

                    setUserInfo(profileData);
                    setFullName(profileData.fullName);
                    setEmail(profileData.email);
                } else {
                    const profileData = {
                        fullName: user.displayName || "",
                        email: user.email || "",
                        photoURL: user.photoURL || DEFAULT_PROFILE_PIC,
                        joinDate: `Joined in ${new Date().getFullYear()}`,
                    };
                    setUserInfo(profileData);
                    setFullName(profileData.fullName);
                    setEmail(profileData.email);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                Alert.alert("Error", "Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, []);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission required",
                    "Gallery permission is needed to change profile picture"
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                const user = auth.currentUser;

                if (!user) {
                    Alert.alert("Error", "No user logged in");
                    return;
                }

                setUploading(true);

                const data = new FormData();
                data.append("file", {
                    uri: imageUri,
                    type: "image/jpeg",
                    name: "profile.jpg",
                } as any);
                data.append("upload_preset", UPLOAD_PRESET);

                const res = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
                const file = await res.json();

                if (!file.secure_url) throw new Error("Upload failed");

                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, { photoURL: file.secure_url });
                await updateProfile(user, { photoURL: file.secure_url });

                setUserInfo((prev) => ({ ...prev, photoURL: file.secure_url }));
                Alert.alert("Success", "Profile picture updated!");
            }
        } catch (err: any) {
            console.error("Image pick error:", err);
            Alert.alert("Error", err.message || "Failed to update profile picture");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveChanges = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "No user logged in");
            return;
        }

        if (!fullName.trim()) {
            Alert.alert("Error", "Full name is required");
            return;
        }

        setSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                fullName: fullName.trim(),
                email: email.trim(),
                updatedAt: new Date(),
            });

            await updateProfile(user, { displayName: fullName.trim() });

            if (newPassword && currentPassword) {
                try {
                    const credential = EmailAuthProvider.credential(
                        user.email!,
                        currentPassword
                    );
                    await reauthenticateWithCredential(user, credential);
                    await updateAuthPassword(user, newPassword);

                    Alert.alert("Success", "Profile updated and password changed!");
                    setCurrentPassword("");
                    setNewPassword("");
                } catch (err: any) {
                    console.error("Password update error:", err);
                    if (err.code === "auth/wrong-password") {
                        Alert.alert("Error", "Current password is incorrect");
                    } else if (err.code === "auth/weak-password") {
                        Alert.alert("Error", "New password is too weak");
                    } else {
                        Alert.alert("Error", "Password update failed, but profile saved");
                    }
                }
            } else {
                Alert.alert("Success", "Profile updated successfully!");
            }

            setUserInfo((prev) => ({
                ...prev,
                fullName: fullName.trim(),
                email: email.trim(),
            }));
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading profile...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 40, top: 30 }}>
                    {/* Profile Section */}
                    <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{ uri: userInfo.photoURL }}
                                style={[styles.profileImage, { borderColor: colors.border }]}
                            />
                            <TouchableOpacity
                                style={[styles.editImageButton, { backgroundColor: colors.primary }]}
                                onPress={handlePickImage}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.editImageIcon}>✏️</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.profileName, { color: colors.text }]}>
                            {userInfo.fullName || "No Name"}
                        </Text>
                        <Text style={[styles.profileJoinDate, { color: colors.textSecondary }]}>
                            {userInfo.joinDate}
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                style={[
                                    styles.textInput,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Enter your full name"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                style={[
                                    styles.textInput,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                Current Password
                            </Text>
                            <TextInput
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                style={[
                                    styles.textInput,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Enter current password"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                New Password
                            </Text>
                            <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                style={[
                                    styles.textInput,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Enter new password"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry
                            />
                            <Text style={[styles.inputHelper, { color: colors.textSecondary }]}>
                                Leave blank to keep your current password.
                            </Text>
                        </View>
                    </View>

                    {/* Save Button Section */}
                    <View style={styles.buttonSection}>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                { backgroundColor: colors.primary },
                                saving && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSaveChanges}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Floating Theme Toggle Button */}
                <TouchableOpacity
                    style={[styles.themeButton, { backgroundColor: colors.primary }]}
                    onPress={toggleTheme}
                    activeOpacity={0.8}
                >
                    {theme === "light" ? (
                        <Moon size={24} color="#fff" />
                    ) : (
                        <Sun size={24} color="#fff" />
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 16 },
    profileSection: {
        alignItems: "center",
        paddingVertical: 30,
        marginBottom: 10,
    },
    profileImageContainer: { position: "relative", marginBottom: 12 },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
    },
    editImageButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        borderRadius: 18,
        padding: 6,
    },
    editImageIcon: { color: "white", fontSize: 14 },
    profileName: { fontSize: 22, fontWeight: "600", marginTop: 10 },
    profileJoinDate: { fontSize: 14 },
    formSection: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputHelper: { fontSize: 12, marginTop: 4 },
    buttonSection: { padding: 20 },
    saveButton: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    themeButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        padding: 16,
        borderRadius: 28,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default Profile;