// app/profile.tsx
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "@/config/firebaseConfig";
import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import {
    updatePassword as updateAuthPassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from "firebase/auth";

const DEFAULT_PROFILE_PIC =
    "https://via.placeholder.com/150/ccc/fff?text=User";

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: "",
        email: "",
        photoURL: DEFAULT_PROFILE_PIC,
        joinDate: "",
    });

    // Form states
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
                    // fallback to auth user
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
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
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

            if (!result.canceled) {
                const user = auth.currentUser;
                if (!user) return;

                const imageUri = result.assets[0].uri;
                const storage = getStorage();
                const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);

                const response = await fetch(imageUri);
                const blob = await response.blob();

                await uploadBytes(storageRef, blob);
                const downloadURL = await getDownloadURL(storageRef);

                // update Firestore
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, { photoURL: downloadURL });

                setUserInfo((prev) => ({ ...prev, photoURL: downloadURL }));

                Alert.alert("Success", "Profile picture updated!");
            }
        } catch (err) {
            console.error("Image upload error:", err);
            Alert.alert("Error", "Failed to update profile picture");
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

            // update password if provided
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
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{ uri: userInfo.photoURL }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity
                                style={styles.editImageButton}
                                onPress={handlePickImage}
                            >
                                <Text style={styles.editImageIcon}>✏️</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.profileName}>
                            {userInfo.fullName || "No Name"}
                        </Text>
                        <Text style={styles.profileJoinDate}>{userInfo.joinDate}</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                style={styles.textInput}
                                placeholder="Enter your full name"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                style={styles.textInput}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <TextInput
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                style={styles.textInput}
                                placeholder="Enter current password"
                                secureTextEntry
                            />
                        </View>

                        {/* New Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                style={styles.textInput}
                                placeholder="Enter new password"
                                secureTextEntry
                            />
                            <Text style={styles.inputHelper}>
                                Leave blank to keep your current password.
                            </Text>
                        </View>
                    </View>

                    {/* Save Button */}
                    <View style={styles.buttonSection}>
                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },

    // Loading
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 16, color: "#6B7280" },

    // Profile
    profileSection: {
        alignItems: "center",
        paddingVertical: 30,
        backgroundColor: "#fff",
        marginBottom: 10,
    },
    profileImageContainer: { position: "relative", marginBottom: 12 },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#E5E7EB",
    },
    editImageButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#3B82F6",
        borderRadius: 18,
        padding: 6,
    },
    editImageIcon: { color: "white", fontSize: 14 },
    profileName: { fontSize: 22, fontWeight: "600", marginTop: 10 },
    profileJoinDate: { fontSize: 14, color: "#6B7280" },

    // Form
    formSection: { backgroundColor: "#fff", padding: 20 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
    textInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#111827",
    },
    inputHelper: { fontSize: 12, color: "#6B7280", marginTop: 4 },

    // Button
    buttonSection: { padding: 20 },
    saveButton: {
        backgroundColor: "#10B981",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonDisabled: { backgroundColor: "#9CA3AF" },
    saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default Profile;
