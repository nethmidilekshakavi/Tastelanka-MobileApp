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

import { auth, db } from "@/config/firebaseConfig";
import {
    doc,
    getDoc,
    updateDoc,
    updatePassword,
} from "firebase/firestore";
import { updatePassword as updateAuthPassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const DEFAULT_PROFILE_PIC =
    "https://i.pinimg.com/736x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: "",
        email: "",
        photoURL: "",
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

                console.log("Current user:", user.uid, user.email);

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    console.log("Firestore data:", userSnap.data());

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
                    console.log("No Firestore profile found, using auth data.");

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


    // Load user profile data
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
                    // Fallback to auth user data
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

    // Save profile changes
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
            // Update Firestore document
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                fullName: fullName.trim(),
                email: email.trim(),
                updatedAt: new Date(),
            });

            // Update password if provided
            if (newPassword && currentPassword) {
                try {
                    // Re-authenticate user before changing password
                    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
                    await reauthenticateWithCredential(user, credential);

                    // Update password
                    await updateAuthPassword(user, newPassword);

                    Alert.alert(
                        "Success",
                        "Profile updated successfully! Password has been changed.",
                        [{ text: "OK", onPress: () => {
                                setCurrentPassword("");
                                setNewPassword("");
                            }}]
                    );
                } catch (passwordError: any) {
                    console.error("Password update error:", passwordError);
                    if (passwordError.code === 'auth/wrong-password') {
                        Alert.alert("Error", "Current password is incorrect");
                    } else if (passwordError.code === 'auth/weak-password') {
                        Alert.alert("Error", "New password is too weak");
                    } else {
                        Alert.alert("Error", "Failed to update password. Profile changes saved.");
                    }
                }
            } else {
                Alert.alert("Success", "Profile updated successfully!");
            }

            // Update local state
            setUserInfo(prev => ({
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Your Profile</Text>
                            <Text style={styles.subtitle}>
                                Manage your personal information and preferences.
                            </Text>
                        </View>
                    </View>

                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{ uri: userInfo.photoURL }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity style={styles.editImageButton}>
                                <Text style={styles.editImageIcon}>✏️</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{userInfo.fullName || "No Name"}</Text>
                            <Text style={styles.profileJoinDate}>{userInfo.joinDate}</Text>
                        </View>
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
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email address</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                style={styles.textInput}
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Current Password (for password change) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <TextInput
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                style={styles.textInput}
                                placeholder="Enter current password to change password"
                                placeholderTextColor="#9CA3AF"
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
                                placeholder="Enter new password (optional)"
                                placeholderTextColor="#9CA3AF"
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
                                <ActivityIndicator size="small" color="#FFFFFF" />
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
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#6B7280",
        fontWeight: "500",
    },

    // Header
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 32,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        lineHeight: 24,
    },

    // Profile Section
    profileSection: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 24,
        paddingVertical: 32,
        marginBottom: 1,
        alignItems: "center",
    },
    profileImageContainer: {
        position: "relative",
        marginBottom: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: "#F3F4F6",
    },
    editImageButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    editImageIcon: {
        fontSize: 16,
    },
    profileInfo: {
        alignItems: "center",
    },
    profileName: {
        fontSize: 24,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    profileJoinDate: {
        fontSize: 14,
        color: "#6B7280",
    },

    // Form Section
    formSection: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#FFFFFF",
    },
    inputHelper: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 6,
        fontStyle: "italic",
    },

    // Button Section
    buttonSection: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    saveButton: {
        backgroundColor: "#10B981",
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: "#9CA3AF",
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default Profile;