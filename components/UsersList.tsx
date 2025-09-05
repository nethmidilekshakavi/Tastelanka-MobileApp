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
import { db } from "@/config/firebaseConfig";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
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
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDoc | null>(null);
    const [updatedName, setUpdatedName] = useState("");
    const [updatedRole, setUpdatedRole] = useState("");

    // Fetch users from Firestore
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

    // Delete user with confirmation
    const handleDelete = (uid: string, userName: string) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete "${userName}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "users", uid));
                            Alert.alert("Success", "User deleted successfully!");
                        } catch (error) {
                            console.error("Error deleting user:", error);
                            Alert.alert("Error", "Failed to delete user");
                        }
                    },
                },
            ]
        );
    };

    // Open edit modal
    const handleEdit = (user: UserDoc) => {
        setSelectedUser(user);
        setUpdatedName(user.fullName || "");
        setUpdatedRole(user.role || "user");
        setEditModalVisible(true);
    };

    // Save updates with validation
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

    // Close modal
    const handleCloseModal = () => {
        setEditModalVisible(false);
        setSelectedUser(null);
        setUpdatedName("");
        setUpdatedRole("");
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading users...</Text>
            </View>
        );
    }

    // Empty state
    if (!users.length) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubText}>
                    Users will appear here once they register
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>Total Users: {users.length}</Text>

            {/* Enhanced Table Header */}
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

            {/* Users Table */}
            <FlatList
                data={users}
                keyExtractor={(item) => item.uid}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View style={[
                        styles.tableRow,
                        index % 2 === 0 ? styles.evenRow : styles.oddRow
                    ]}>
                        {/* Profile Picture */}
                        <View style={styles.cell}>
                            <Image
                                source={{ uri: item.photoURL || DEFAULT_PROFILE_PIC }}
                                style={styles.profileImage}
                                onError={() => console.log("Error loading image")}
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
                            <View style={[
                                styles.roleBadge,
                                item.role === 'admin' ? styles.adminBadge : styles.userBadge
                            ]}>
                                <Text style={[
                                    styles.roleText,
                                    item.role === 'admin' ? styles.adminText : styles.userText
                                ]}>
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
                                    <Text style={styles.editButtonText}>Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(item.uid, item.fullName || "User")}
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Enhanced Edit Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit User Details</Text>

                        {selectedUser && (
                            <View style={styles.userInfo}>
                                <Image
                                    source={{ uri: selectedUser.photoURL || DEFAULT_PROFILE_PIC }}
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

                        <View style={styles.modalButtons}>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 20,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },

    // Table Styles
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#D1D5DB',
    },
    headerCell: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    nameColumn: {
        flex: 2,
    },
    emailColumn: {
        flex: 2,
    },
    headerText: {
        fontWeight: '600',
        color: '#374151',
        fontSize: 14,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    evenRow: {
        backgroundColor: '#FFFFFF',
    },
    oddRow: {
        backgroundColor: '#F9FAFB',
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
    },

    // Profile Image
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },

    // Text Styles
    nameText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
        textAlign: 'center',
    },
    emailText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },

    // Role Badge
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 50,
    },
    adminBadge: {
        backgroundColor: '#FEE2E2',
    },
    userBadge: {
        backgroundColor: '#E0F2FE',
    },
    roleText: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    adminText: {
        color: '#DC2626',
    },
    userText: {
        color: '#0891B2',
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 4,
    },
    editButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalProfileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    modalUserEmail: {
        fontSize: 14,
        color: '#6B7280',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: '#6B7280',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default UsersList;