import { db } from "@/config/firebaseConfig";
import { Category } from "@/types/Category";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    TextInput,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
} from "react-native";

export const CategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");

    // Fetch categories
    useEffect(() => {
        const q = query(collection(db, "categories"), orderBy("name"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const categoriesList = snapshot.docs.map(doc => ({
                cid: doc.id, // Firestore document ID
                ...doc.data()
            })) as Category[];
            setCategories(categoriesList);
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
                const catRef = doc(db, "categories", selectedCategory.cid!);
                await updateDoc(catRef, {
                    name: categoryName.trim(),
                    description: categoryDescription.trim(),
                    updatedAt: new Date(),
                });
                Alert.alert("Success", "Category updated successfully!");
            } else {
                // Add
                await addDoc(collection(db, "categories"), {
                    name: categoryName.trim(),
                    description: categoryDescription.trim(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                Alert.alert("Success", "Category added successfully!");
            }

            setSelectedCategory(null);
            setCategoryName("");
            setCategoryDescription("");
        } catch (err) {
            console.error("Error saving category:", err);
            Alert.alert("Error", "Failed to save category");
        }
    };

    // Delete Category with confirmation
    const confirmDelete = (category: Category) => {
        if (!category.cid) {
            Alert.alert("Error", "Category ID is missing");
            return;
        }
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${category.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => handleDelete(category) },
            ]
        );
    };

    const handleDelete = async (category: Category) => {
        try {
            if (!category.cid) throw new Error("Category ID is undefined");

            const catRef = doc(db, "categories", category.cid);
            await deleteDoc(catRef);

            if (selectedCategory && selectedCategory.cid === category.cid) {
                setSelectedCategory(null);
                setCategoryName("");
                setCategoryDescription("");
            }

            Alert.alert("Success", "Category deleted successfully!");
        } catch (err) {
            console.error("Error deleting category:", err);
            Alert.alert("Error", "Failed to delete category");
        }
    };

    const openEditModal = (category: Category | null = null) => {
        if (category) {
            setSelectedCategory(category);
            setCategoryName(category.name);
            setCategoryDescription(category.description || "");
        } else {
            setSelectedCategory(null);
            setCategoryName("");
            setCategoryDescription("");
        }
    };

    const cancelEdit = () => {
        setSelectedCategory(null);
        setCategoryName("");
        setCategoryDescription("");
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
            <ScrollView style={styles.content}>
                <View style={styles.mainHeader}>
                    <View>
                        <Text style={styles.mainTitle}>Category Management</Text>
                        <Text style={styles.mainSubtitle}>
                            Add, edit, and manage your categories.
                        </Text>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* Left Panel - Add/Edit Form */}
                    <View style={styles.leftPanel}>
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>
                                {selectedCategory ? "Edit Category" : "Add New Category"}
                            </Text>
                            <Text style={styles.formSubtitle}>
                                {selectedCategory
                                    ? "Update the category details below."
                                    : "Fill in the details below to create a new category."}
                            </Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Category Name</Text>
                                <TextInput
                                    value={categoryName}
                                    onChangeText={setCategoryName}
                                    placeholder="e.g. Customer Support"
                                    style={styles.input}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    value={categoryDescription}
                                    onChangeText={setCategoryDescription}
                                    placeholder="A brief description of this category."
                                    style={[styles.input, styles.textArea]}
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSave}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.submitButtonText}>
                                    {selectedCategory ? "Update Category" : "Add Category"}
                                </Text>
                            </TouchableOpacity>

                            {selectedCategory && (
                                <TouchableOpacity
                                    style={styles.cancelEditButton}
                                    onPress={cancelEdit}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.cancelEditButtonText}>Cancel Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Right Panel - Categories List */}
                    <View style={styles.rightPanel}>
                        <View style={styles.tableCard}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                                    CATEGORY NAME
                                </Text>
                                <Text style={[styles.tableHeaderText, { flex: 3 }]}>
                                    DESCRIPTION
                                </Text>
                                <Text
                                    style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}
                                >
                                    ACTIONS
                                </Text>
                            </View>

                            {categories.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyIcon}>📂</Text>
                                    <Text style={styles.emptyTitle}>No categories yet</Text>
                                    <Text style={styles.emptySubtitle}>
                                        Create your first category to get started
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={categories}
                                    keyExtractor={(item) => item.cid!}
                                    scrollEnabled={false}
                                    renderItem={({ item, index }) => (
                                        <View
                                            style={[
                                                styles.tableRow,
                                                index === categories.length - 1 && styles.lastRow,
                                            ]}
                                        >
                                            <Text
                                                style={[styles.tableCellName, { flex: 2 }]}
                                                numberOfLines={1}
                                            >
                                                {item.name}
                                            </Text>
                                            <Text
                                                style={[styles.tableCellDescription, { flex: 3 }]}
                                                numberOfLines={2}
                                            >
                                                {item.description || "No description provided."}
                                            </Text>
                                            <View style={[styles.actionsCell, { flex: 1 }]}>
                                                <TouchableOpacity
                                                    style={styles.editLink}
                                                    onPress={() => openEditModal(item)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.editLinkText}>Edit</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.editLink}
                                                    onPress={() => confirmDelete(item)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={[styles.editLinkText, styles.deleteText]}>
                                                        Delete
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#6B7280",
    },
    mainHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    mainSubtitle: {
        fontSize: 16,
        color: "#6B7280",
        fontWeight: "400",
    },
    mainContent: {
        flexDirection: "row",
        gap: 24,
    },
    leftPanel: {
        flex: 1,
        maxWidth: 400,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 24,
        lineHeight: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: "#111827",
        backgroundColor: "#FFFFFF",
    },
    textArea: {
        height: 96,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    cancelEditButton: {
        backgroundColor: "#F3F4F6",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
    },
    cancelEditButtonText: {
        color: "#6B7280",
        fontSize: 14,
        fontWeight: "500",
    },
    rightPanel: {
        flex: 2,
    },
    tableCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        overflow: "hidden",
    },
    tableHeaderRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#F9FAFB",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        alignItems: "flex-start",
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    tableCellName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
        marginRight: 16,
    },
    tableCellDescription: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
        marginRight: 16,
    },
    actionsCell: {
        alignItems: "flex-end",
    },
    editLink: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    editLinkText: {
        fontSize: 14,
        color: "#2563EB",
        fontWeight: "500",
    },
    deleteText: {
        color: "#EF4444",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
        paddingHorizontal: 24,
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
});