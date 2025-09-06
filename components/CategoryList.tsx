import { db } from "@/config/firebaseConfig";
import { Category } from "@/types/Category";
import {addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {Alert, FlatList, Modal, TextInput, TouchableOpacity, View, Text, StyleSheet, ActivityIndicator, SafeAreaView} from "react-native";

export const CategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState("");

    // Fetch categories
    useEffect(() => {
        const q = collection(db, "categories");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Category[] = snapshot.docs.map(doc => ({
                cid: doc.id,
                ...(doc.data() as any)
            }));
            setCategories(list);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);


    // Add or Update Category
    const handleSave = async () => {
        if (!categoryName.trim()) {
            Alert.alert("Error", "Category name is required");
            return;
        }

        try {
            if (selectedCategory) {
                // Update
                const catRef = doc(db, "categories", selectedCategory.cid);
                await updateDoc(catRef, { name: categoryName.trim() });
            } else {
                // Add
                await addDoc(collection(db, "categories"), { name: categoryName.trim() });
            }

            setModalVisible(false);
            setSelectedCategory(null);
            setCategoryName("");
            Alert.alert("Success", "Category saved successfully!");
        } catch (err) {
            console.error("Error saving category:", err);
            Alert.alert("Error", "Failed to save category");
        }
    };

    // Delete Category with confirmation
    const confirmDelete = (cid: string, name: string) => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => handleDelete(cid) }
            ]
        );
    };

    const handleDelete = async (cid: string) => {
        try {
            const cateRef = doc(db, "categories", cid);
            await deleteDoc(cateRef);
            Alert.alert("Success", "Category deleted successfully!");
        } catch (error) {
            console.error("Error deleting Category:", error);
            Alert.alert("Error", "Failed to delete Category");
        }
    };

    const openEditModal = (category: Category | null = null) => {
        if (category) {
            setSelectedCategory(category);
            setCategoryName(category.name);
        } else {
            setSelectedCategory(null);
            setCategoryName("");
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedCategory(null);
        setCategoryName("");
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22C55E" />
                <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerIcon}>🏷️</Text>
                        <View>
                            <Text style={styles.headerTitle}>Categories</Text>
                            <Text style={styles.headerSubtitle}>
                                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Add Category Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => openEditModal()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.addButtonIcon}>+</Text>
                    <Text style={styles.addButtonText}>Add New Category</Text>
                </TouchableOpacity>

                {/* Categories List */}
                {categories.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📂</Text>
                        <Text style={styles.emptyTitle}>No Categories Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Create your first category to get started
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={categories}
                        keyExtractor={(item) => item.cid}
                        renderItem={({ item, index }) => (
                            <View style={[styles.categoryCard, { marginTop: index === 0 ? 0 : 12 }]}>
                                <View style={styles.categoryContent}>
                                    <View style={styles.categoryIcon}>
                                        <Text style={styles.categoryIconText}>#</Text>
                                    </View>
                                    <View style={styles.categoryInfo}>
                                        <Text style={styles.categoryName}>{item.name}</Text>
                                        <Text style={styles.categoryId}>ID: {item.cid}</Text>
                                    </View>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => openEditModal(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.editButtonText}>✏️</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDelete(item.cid, item.name || "categories")}
                                    >
                                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

                {/* Modal */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {selectedCategory ? "Edit Category" : "Add Category"}
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={closeModal}
                                >
                                    <Text style={styles.closeButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.inputLabel}>Category Name</Text>
                                <TextInput
                                    value={categoryName}
                                    onChangeText={setCategoryName}
                                    placeholder="Enter category name"
                                    style={styles.textInput}
                                    autoFocus
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={closeModal}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSave}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {selectedCategory ? "Update" : "Save"}
                                    </Text>
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
        backgroundColor: "#F0FDF4", // Very light green background
    },
    content: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0FDF4",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#22C55E",
        fontWeight: "500",
    },

    // Header Styles
    header: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#065F46", // Dark green
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },

    // Add Button Styles
    addButton: {
        backgroundColor: "#22C55E", // Main green
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    addButtonIcon: {
        fontSize: 20,
        color: "#FFFFFF",
        fontWeight: "bold",
        marginRight: 8,
    },
    addButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },

    // Empty State
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#065F46",
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
    },

    // Category Card Styles
    categoryCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderLeftWidth: 4,
        borderLeftColor: "#22C55E",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    categoryContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#DCFCE7", // Light green
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    categoryIconText: {
        fontSize: 18,
        color: "#22C55E",
        fontWeight: "bold",
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#065F46",
        marginBottom: 2,
    },
    categoryId: {
        fontSize: 12,
        color: "#9CA3AF",
    },

    // Action Buttons
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    editButton: {
        backgroundColor: "#DCFCE7",
        padding: 8,
        borderRadius: 8,
        minWidth: 36,
        alignItems: "center",
    },
    editButtonText: {
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: "#FEE2E2",
        padding: 8,
        borderRadius: 8,
        minWidth: 36,
        alignItems: "center",
    },
    deleteButtonText: {
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
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F0FDF4",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#065F46",
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },
    closeButtonText: {
        fontSize: 20,
        color: "#6B7280",
        fontWeight: "bold",
    },
    modalBody: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 2,
        borderColor: "#D1FAE5",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#F9FAFB",
        color: "#111827",
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        padding: 20,
        backgroundColor: "#F9FAFB",
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: "#E5E7EB",
    },
    cancelButtonText: {
        color: "#6B7280",
        fontWeight: "600",
        fontSize: 16,
    },
    saveButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: "#22C55E",
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
});