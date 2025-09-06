// app/users.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    StyleSheet,
} from "react-native";

import { auth, db ,functions } from "@/config/firebaseConfig";


import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    getDoc, deleteDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
type UserDoc = {
    uid: string;
    fullName?: string;
    email?: string;
    role?: string;
    photoURL?: string | null;
};

const DEFAULT_PROFILE_PIC =
    "https://i.pinimg.com/736x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";

const UsersList = () => {
    const [users, setUsers] = useState<UserDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDoc | null>(null);
    const [updatedName, setUpdatedName] = useState("");
    const [updatedRole, setUpdatedRole] = useState("");

    // 🔹 Current user + role
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string>("user");

    // Fetch users list
    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("fullName"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const usersList: UserDoc[] = snapshot.docs.map((doc) => ({
                    uid: doc.id,
                    ...(doc.data() as UserDoc),
                }));
                setUsers(usersList);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching users:", error);
                setLoading(false);
                Alert.alert("Error", "Failed to load users");
            }
        );
        return () => unsubscribe();
    }, []);

    // Fetch current user + role
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setCurrentUser(user);

            const fetchRole = async () => {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setCurrentUserRole(userSnap.data().role || "user");
                    }
                } catch (err) {
                    console.error("Failed to fetch role:", err);
                }
            };

            fetchRole();
        }
    }, []);

    // Delete user
    const handleDelete = async (uid: string) => {
        try {
            const userRef = doc(db, "users", uid);
            await deleteDoc(userRef);
            Alert.alert("Success", "User deleted successfully!");
            // Optionally refresh the user list or state
        } catch (error) {
            console.error("Error deleting user:", error);
            Alert.alert("Error", "Failed to delete user");
        }
    };


    // Open edit modal
    const handleEdit = (user: UserDoc) => {
        setSelectedUser(user);
        setUpdatedName(user.fullName || "");
        setUpdatedRole(user.role || "user");
        setEditModalVisible(true);
    };

    // Save updates
    const handleSave = async () => {
        if (!selectedUser) return;

        if (!updatedName.trim()) {
            Alert.alert("Error", "Full name is required");
            return;
        }

        try {
            const userRef = doc(db, "users", selectedUser.uid);
            await updateDoc(userRef, {
                fullName: updatedName.trim(),
                role: updatedRole.toLowerCase(),
            });
            setEditModalVisible(false);
            setSelectedUser(null);
            Alert.alert("Success", "User updated successfully!");
        } catch (error) {
            console.error("Error updating user:", error);
            Alert.alert("Error", "Failed to update user");
        }
    };

    const handleCloseModal = () => {
        setEditModalVisible(false);
        setSelectedUser(null);
        setUpdatedName("");
        setUpdatedRole("");
    };

    if (loading) {
        return (
            <View>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading users...</Text>
            </View>
        );
    }

    if (!users.length) {
        return (
            <View>
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubText}>
                    Users will appear here once they register
                </Text>
            </View>
        );
    }

    return (
        <View>
            <Text style={styles.subtitle}>👥 Total Users: {users.length}</Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <View style={styles.headerCell}>
                    <Text style={styles.headerText}>Profile</Text>
                </View>
                <View style={[styles.headerCell, styles.nameColumn]}>
                    <Text style={styles.headerText}>Full Name</Text>
                </View>
                <View style={[styles.headerCell, styles.emailColumn]}>
                    <Text style={styles.headerText}>Email</Text>
                </View>
                <View style={styles.headerCell}>
                    <Text style={styles.headerText}>Role</Text>
                </View>
                <View style={styles.headerCell}>
                    <Text style={styles.headerText}>Actions</Text>
                </View>
            </View>

            {/* Users */}
            <FlatList
                data={users}
                keyExtractor={(item) => item.uid}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View
                        style={[
                            styles.tableRow,
                            index % 2 === 0 ? styles.evenRow : styles.oddRow,
                        ]}
                    >
                        {/* Profile */}
                        <View style={styles.cell}>
                            <Image
                                source={{ uri: item.photoURL || DEFAULT_PROFILE_PIC }}
                                style={styles.profileImage}
                            />
                        </View>

                        {/* Full Name */}
                        <View style={[styles.cell, styles.nameColumn]}>
                            <Text style={styles.nameText} numberOfLines={2}>
                                {item.fullName || "No Name"}
                            </Text>
                        </View>

                        {/* Email */}
                        <View style={[styles.cell, styles.emailColumn]}>
                            <Text style={styles.emailText} numberOfLines={2}>
                                {item.email || "No Email"}
                            </Text>
                        </View>

                        {/* Role */}
                        <View style={styles.cell}>
                            <View
                                style={[
                                    styles.roleBadge,
                                    item.role === "admin" ? styles.adminBadge : styles.userBadge,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.roleText,
                                        item.role === "admin" ? styles.adminText : styles.userText,
                                    ]}
                                >
                                    {(item.role || "user").toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.cell}>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEdit(item)}
                                >
                                    <Text style={styles.editButtonText}>✏️ Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(item.uid, item.fullName || "User")}
                                >
                                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>✏️ Edit User Details</Text>

                        {selectedUser && (
                            <View style={styles.userInfo}>
                                <Image
                                    source={{
                                        uri: selectedUser.photoURL || DEFAULT_PROFILE_PIC,
                                    }}
                                    style={styles.modalProfileImage}
                                />
                                <Text style={styles.modalUserEmail}>
                                    {selectedUser.email}
                                </Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput
                                value={updatedName}
                                onChangeText={setUpdatedName}
                                style={styles.textInput}
                                placeholder="Enter full name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Role</Text>
                            <TextInput
                                value={updatedRole}
                                onChangeText={setUpdatedRole}
                                style={styles.textInput}
                                placeholder="user or admin"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCloseModal}
                            >
                                <Text style={styles.cancelButtonText}>❌ Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>💾 Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};




const styles = StyleSheet.create({
    subtitle: {
        fontSize: 20,
        color: "#2563EB",
        marginBottom: 20,
        fontWeight: "bold",
    },
    loadingText: {
        marginTop: 12,
        color: "#6B7280",
        fontSize: 16,
    },
    emptyText: {
        fontSize: 20,
        color: "#EF4444",
        textAlign: "center",
        marginBottom: 8,
        fontWeight: "bold",
    },
    emptySubText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },

    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#93C5FD",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomWidth: 2,
        borderBottomColor: "#3B82F6",
    },
    headerCell: { flex: 1, alignItems: "center", paddingHorizontal: 4 },
    nameColumn: { flex: 2 },
    emailColumn: { flex: 2 },
    headerText: {
        fontWeight: "700",
        color: "#1E3A8A",
        fontSize: 14,
    },

    tableRow: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: "center",
    },
    evenRow: { backgroundColor: "#E0F2FE" },
    oddRow: { backgroundColor: "#FFFFFF" },
    separator: { height: 1, backgroundColor: "#BFDBFE" },

    cell: { flex: 1, alignItems: "center", paddingHorizontal: 4 },

    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#3B82F6",
    },

    nameText: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
        textAlign: "center",
    },
    emailText: { fontSize: 12, color: "#4B5563", textAlign: "center" },

    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 60,
    },
    adminBadge: { backgroundColor: "#FECACA" },
    userBadge: { backgroundColor: "#BBF7D0" },
    roleText: { fontSize: 10, fontWeight: "700", textAlign: "center" },
    adminText: { color: "#B91C1C" },
    userText: { color: "#047857" },

    actionButtons: { flexDirection: "row", gap: 6 },
    editButton: {
        backgroundColor: "#2563EB",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    editButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
    deleteButton: {
        backgroundColor: "#DC2626",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    deleteButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        padding: 24,
        borderRadius: 12,
        width: "100%",
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2563EB",
        marginBottom: 16,
        textAlign: "center",
    },
    userInfo: { alignItems: "center", marginBottom: 20 },
    modalProfileImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
    modalUserEmail: { fontSize: 14, color: "#6B7280" },

    inputGroup: { marginBottom: 16 },
    inputLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#93C5FD",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#1F2937",
        backgroundColor: "#F9FAFB",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: "#6B7280",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
    },
    cancelButtonText: { color: "#FFFFFF", fontWeight: "700" },
    saveButton: {
        backgroundColor: "#10B981",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
    },
    saveButtonText: { color: "#FFFFFF", fontWeight: "700" },
});

export default UsersList;
