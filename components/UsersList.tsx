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
    SafeAreaView,
} from "react-native";

import { auth, db, functions } from "@/config/firebaseConfig";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    getDoc,
    deleteDoc,
} from "firebase/firestore";

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
    const [filteredUsers, setFilteredUsers] = useState<UserDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDoc | null>(null);
    const [updatedName, setUpdatedName] = useState("");
    const [updatedRole, setUpdatedRole] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // 🔹 Current user + role
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string>("user");

    // Filter users based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter((user) =>
                user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [users, searchQuery]);

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
    const handleDelete = async (userId: string | undefined) => {
        if (!userId) {
            Alert.alert("Error", "User ID is undefined!");
            return;
        }

        try {
            const userRef = doc(db, "users", userId);  // Firestore document reference
            await deleteDoc(userRef);                  // Delete document
            setSelectedUser(null);
            Alert.alert("Success", "User deleted successfully!");
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
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Loading users...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>User Management</Text>
                </View>

                {/* Search and Filter Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search users..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterIcon}>⚙️</Text>
                        <Text style={styles.filterText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                {filteredUsers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👥</Text>
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? "No users found" : "No users yet"}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? "Try adjusting your search terms"
                                : "Users will appear here once they register"
                            }
                        </Text>
                    </View>
                ) : (
                    <View style={styles.tableContainer}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, { flex: 1 }]}>NAME</Text>
                            <Text style={[styles.headerCell, { flex: 1.5 }]}>EMAIL</Text>
                            <Text style={[styles.headerCell, { flex: 0.8 }]}>ROLE</Text>
                            <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'center' }]}>ACTIONS</Text>
                        </View>

                        {/* Users List */}
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={(item) => item.uid}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <View style={styles.tableRow}>
                                    {/* Name with Profile */}
                                    <View style={[styles.nameCell, { flex: 1 }]}>
                                        <Image
                                            source={{ uri: item.photoURL || DEFAULT_PROFILE_PIC }}
                                            style={styles.profileImage}
                                        />
                                        <Text style={styles.nameText} numberOfLines={1}>
                                            {item.fullName || "No Name"}
                                        </Text>
                                    </View>

                                    {/* Email */}
                                    <View style={[styles.cell, { flex: 1.5 }]}>
                                        <Text style={styles.emailText} numberOfLines={1}>
                                            {item.email || "No Email"}
                                        </Text>
                                    </View>

                                    {/* Role */}
                                    <View style={[styles.cell, { flex: 0.8 }]}>
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
                                                {(item.role || "User")}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Actions */}
                                    <View style={[styles.actionsCell, { flex: 0.8 }]}>
                                        <TouchableOpacity
                                            style={styles.editIcon}
                                            onPress={() => handleEdit(item)}
                                        >
                                            <Text style={styles.actionIcon}>✏️</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteIcon}
                                            onPress={() => handleDelete(item.uid, item.fullName || "User")}
                                        >
                                            <Text style={styles.actionIcon}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                )}

                {/* Edit Modal */}
                <Modal
                    visible={editModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit User</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleCloseModal}
                                >
                                    <Text style={styles.closeButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>

                            {selectedUser && (
                                <View style={styles.modalBody}>
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

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Full Name</Text>
                                        <TextInput
                                            value={updatedName}
                                            onChangeText={setUpdatedName}
                                            style={styles.textInput}
                                            placeholder="Enter full name"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Role</Text>
                                        <TextInput
                                            value={updatedRole}
                                            onChangeText={setUpdatedRole}
                                            style={styles.textInput}
                                            placeholder="user or admin"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                            )}

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCloseModal}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    content: {
        flex: 1,
        padding: 24,
    },

    // Loading State
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#111827",
    },
    addButton: {
        backgroundColor: "#2563EB",
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    addButtonText: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "600",
    },

    // Search and Filter
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
        color: "#6B7280",
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#111827",
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    filterIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    filterText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },

    // Empty State
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderStyle: "dashed",
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },

    // Table
    tableContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
        flex: 1,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#F9FAFB",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerCell: {
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        alignItems: "center",
        minHeight: 56,
    },

    // Cells
    nameCell: {
        flexDirection: "row",
        alignItems: "center",
    },
    cell: {
        justifyContent: "center",
    },
    actionsCell: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },

    // Profile & Text
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    nameText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
        flex: 1,
    },
    emailText: {
        fontSize: 14,
        color: "#6B7280",
    },

    // Role Badge
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: "center",
    },
    adminBadge: {
        backgroundColor: "#DBEAFE",
    },
    userBadge: {
        backgroundColor: "#D1FAE5",
    },
    roleText: {
        fontSize: 12,
        fontWeight: "500",
        textTransform: "capitalize",
    },
    adminText: {
        color: "#1E40AF",
    },
    userText: {
        color: "#059669",
    },

    // Action Icons
    editIcon: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: "#F3F4F6",
    },
    deleteIcon: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: "#F3F4F6",
    },
    actionIcon: {
        fontSize: 16,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        width: "100%",
        maxWidth: 400,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F8FAFC",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
    },
    closeButtonText: {
        fontSize: 16,
        color: "#64748B",
        fontWeight: "bold",
    },
    modalBody: {
        padding: 20,
    },
    userInfo: {
        alignItems: "center",
        marginBottom: 20,
    },
    modalProfileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: "#E5E7EB",
    },
    modalUserEmail: {
        fontSize: 14,
        color: "#6B7280",
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: "#111827",
        backgroundColor: "#FAFAFA",
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        padding: 20,
        backgroundColor: "#F8FAFC",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#CBD5E1",
    },
    cancelButtonText: {
        color: "#64748B",
        fontWeight: "600",
        fontSize: 14,
    },
    saveButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#2563EB",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
    },
});

export default UsersList;