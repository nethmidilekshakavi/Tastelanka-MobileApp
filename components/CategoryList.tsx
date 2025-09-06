import { db } from "@/config/firebaseConfig";
import { Category } from "@/types/Category";
import {addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {Alert, FlatList, Modal, TextInput, TouchableOpacity, View,Text,StyleSheet,
} from "react-native";

export const CategoryManagemt = () => {
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
                const catRef = doc(db, "categories", selectedCategory.id);
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

    // Delete Category
    const handleDelete = async (id: string) => {
        try {
            const catRef = doc(db, "categories", id);
            await deleteDoc(catRef);
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
        }
        setModalVisible(true);
    };

    return (
        <View style={{ padding: 16 }}>
            🏷️ Categories ({categories.length})

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => openEditModal()}
            >
                <Text style={styles.addButtonText}>➕ Add Category</Text>
            </TouchableOpacity>

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.categoryRow}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => openEditModal(item)}>
                                <Text style={styles.editText}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Text style={styles.deleteText}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                            {selectedCategory ? "Edit Category" : "Add Category"}
                        </Text>
                        <TextInput
                            value={categoryName}
                            onChangeText={setCategoryName}
                            placeholder="Enter category name"
                            style={styles.textInput}
                        />
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{ color: "#fff" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                            >
                                <Text style={{ color: "#fff" }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    addButton: {
        backgroundColor: "#2563EB",
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
        alignItems: "center",
    },
    addButtonText: { color: "#fff", fontWeight: "bold" },
    categoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#DDD",
        alignItems: "center",
    },
    categoryName: { fontSize: 16 },
    actions: { flexDirection: "row", gap: 12 },
    editText: { fontSize: 18, color: "#2563EB" },
    deleteText: { fontSize: 18, color: "#DC2626" },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 16,
    },
    modalContent: {
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: 400,
        padding: 20,
        borderRadius: 12,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#2563EB",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: "#6B7280",
        padding: 10,
        borderRadius: 6,
        marginRight: 8,
    },
    saveButton: {
        backgroundColor: "#10B981",
        padding: 10,
        borderRadius: 6,
    },
});
