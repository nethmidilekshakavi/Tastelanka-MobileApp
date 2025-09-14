import { db } from "@/config/firebaseConfig";
import { collection, addDoc, doc, deleteDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
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
    Image,
    Modal,
} from "react-native";
import { Recipe } from "@/types/Recipe";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from '@react-native-picker/picker';
import {Category} from "@/types/Category";

const ASSET_IMAGES = [
    { id: 1, name: "Rice & Curry", source: require("../assets/images/fac132dbf73ecd95071f6da669ce7f15.jpg") },
    { id: 2, name: "Kottu", source: require("../assets/images/afa40a8a807f868115dc42478d05f8b0.jpg") },
  ]

export const RecipeManagement = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [instructions, setInstructions] = useState("");
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    // Fetch categories
    useEffect(() => {
        const q = query(collection(db, "categories"), orderBy("name"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const categoriesList = snapshot.docs.map(doc => ({
                cid: doc.id,
                name: doc.data().name
            })) as Category[];
            setCategories(categoriesList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    // Fetch recipes
    useEffect(() => {
        const q = query(collection(db, "recipes"), orderBy("title"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const recipeList = snapshot.docs.map((doc) => ({
                rid: doc.id,
                ...doc.data(),
            })) as Recipe[];
            setRecipes(recipeList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getSelectedImageSource = () => {
        if (!selectedImageId) return null;
        const image = ASSET_IMAGES.find(img => img.id === selectedImageId);
        return image ? image.source : null;
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "Recipe title is required");
            return;
        }
        if (!category.trim()) {
            Alert.alert("Error", "Category is required");
            return;
        }
        if (!selectedImageId) {
            Alert.alert("Error", "Please select an image");
            return;
        }

        try {
            const recipeData = {
                title: title.trim(),
                description: description.trim(),
                ingredients: ingredients.trim(),
                instructions: instructions.trim(),
                imageId: selectedImageId,
                category: category,
                updatedAt: new Date(),
            };

            if (selectedRecipe) {
                const recipeRef = doc(db, "recipes", selectedRecipe.rid!);
                await updateDoc(recipeRef, recipeData);
                Alert.alert("Success", "Recipe updated successfully!");
            } else {
                await addDoc(collection(db, "recipes"), {
                    ...recipeData,
                    createdAt: new Date(),
                });
                Alert.alert("Success", "Recipe added successfully!");
            }
            cancelEdit();
        } catch (err) {
            console.error("Error saving recipe:", err);
            Alert.alert("Error", "Failed to save recipe");
        }
    };

    const confirmDelete = (recipe: Recipe) => {
        if (!recipe.rid) return Alert.alert("Error", "Recipe ID is missing");
        Alert.alert("Delete Recipe", `Are you sure you want to delete "${recipe.title}"?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => handleDelete(recipe) },
        ]);
    };

    const handleDelete = async (recipe: Recipe) => {
        try {
            if (!recipe.rid) throw new Error("Recipe ID is undefined");
            await deleteDoc(doc(db, "recipes", recipe.rid));
            if (selectedRecipe?.rid === recipe.rid) cancelEdit();
            Alert.alert("Success", "Recipe deleted successfully!");
        } catch (err) {
            console.error("Error deleting recipe:", err);
            Alert.alert("Error", "Failed to delete recipe");
        }
    };

    const openAddForm = () => {
        setShowForm(true);
        setSelectedRecipe(null);
        clearForm();
    };

    const openEdit = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setTitle(recipe.title);
        setDescription(recipe.description || "");
        setIngredients(recipe.ingredients || "");
        setInstructions(recipe.instructions || "");
        setSelectedImageId(recipe.imageId || null);
        setCategory(recipe.category || "");
        setShowForm(true);
    };

    const clearForm = () => {
        setTitle("");
        setDescription("");
        setIngredients("");
        setInstructions("");
        setSelectedImageId(null);
        setCategory("");
    };

    const cancelEdit = () => {
        setSelectedRecipe(null);
        setShowForm(false);
        clearForm();
    };

    const selectImage = (imageId: number) => {
        setSelectedImageId(imageId);
        setShowImagePicker(false);
    };

    const getRecipeImageSource = (recipe: Recipe) => {
        if (!recipe.imageId) return null;
        const image = ASSET_IMAGES.find(img => img.id === recipe.imageId);
        return image ? image.source : null;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading recipes...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Recipes</Text>
                    <Text style={styles.headerSubtitle}>{recipes.length} recipes available</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
                    <Icon name="add" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Add Recipe</Text>
                </TouchableOpacity>
            </View>

            {/* Recipe Grid */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => item.rid!}
                    numColumns={4}
                    scrollEnabled={false}
                    contentContainerStyle={styles.recipesContainer}
                    columnWrapperStyle={styles.recipeRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.recipeCard}
                            onPress={() => openEdit(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.imageContainer}>
                                {getRecipeImageSource(item) ? (
                                    <Image source={getRecipeImageSource(item)} style={styles.recipeImage} />
                                ) : (
                                    <View style={styles.recipeImagePlaceholder}>
                                        <Icon name="restaurant-menu" size={32} color="#9CA3AF" />
                                    </View>
                                )}
                                <View style={styles.imageOverlay}>
                                    <TouchableOpacity
                                        style={styles.editIconButton}
                                        onPress={() => openEdit(item)}
                                    >
                                        <Icon name="edit" size={16} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteIconButton}
                                        onPress={() => confirmDelete(item)}
                                    >
                                        <Icon name="delete" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.recipeInfo}>
                                <Text style={styles.recipeTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>
                                <Text style={styles.recipeCategory} numberOfLines={1}>
                                    {item.category || "Uncategorized"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="restaurant-menu" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No recipes yet</Text>
                            <Text style={styles.emptySubtitle}>Add your first recipe to get started</Text>
                        </View>
                    }
                />
            </ScrollView>

            {/* Recipe Form Modal */}
            <Modal
                visible={showForm}
                animationType="slide"
                presentationStyle="formSheet"
                onRequestClose={cancelEdit}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={cancelEdit} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {selectedRecipe ? "Edit Recipe" : "Add New Recipe"}
                        </Text>
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                        {/* Image Selection */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionLabel}>Recipe Image *</Text>
                            <TouchableOpacity
                                style={styles.imageSelector}
                                onPress={() => setShowImagePicker(true)}
                            >
                                {selectedImageId ? (
                                    <Image source={getSelectedImageSource()} style={styles.selectedImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Icon name="add-a-photo" size={32} color="#9CA3AF" />
                                        <Text style={styles.placeholderText}>Tap to select image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Basic Information */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionLabel}>Recipe Title *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter recipe name"
                                value={title}
                                onChangeText={setTitle}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.sectionLabel}>Category *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={category}
                                    onValueChange={(itemValue) => setCategory(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a category" value="" />
                                    {categories.map((cat) => (
                                        <Picker.Item key={cat.cid} label={cat.name} value={cat.name} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.sectionLabel}>Description</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Brief description of your recipe"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.sectionLabel}>Ingredients</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="List ingredients (comma separated)"
                                value={ingredients}
                                onChangeText={setIngredients}
                                multiline
                                numberOfLines={4}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.sectionLabel}>Instructions</Text>
                            <TextInput
                                style={[styles.textInput, styles.textAreaLarge]}
                                placeholder="Step-by-step cooking instructions"
                                value={instructions}
                                onChangeText={setInstructions}
                                multiline
                                numberOfLines={6}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Image Picker Modal */}
            <Modal
                visible={showImagePicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowImagePicker(false)}
            >
                <View style={styles.imageModalOverlay}>
                    <View style={styles.imageModalContent}>
                        <View style={styles.imageModalHeader}>
                            <Text style={styles.imageModalTitle}>Choose Recipe Image</Text>
                            <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                                <Icon name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={ASSET_IMAGES}
                            numColumns={2}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.imageGrid}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.imageOption,
                                        selectedImageId === item.id && styles.selectedImageOption
                                    ]}
                                    onPress={() => selectImage(item.id)}
                                >
                                    <Image source={item.source} style={styles.imageOptionImage} />
                                    <Text style={styles.imageOptionText}>{item.name}</Text>
                                    {selectedImageId === item.id && (
                                        <View style={styles.selectedOverlay}>
                                            <Icon name="check-circle" size={20} color="#6366F1" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1E293B",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 2,
    },
    addButton: {
        backgroundColor: "#6366F1",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 4,
        fontSize: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    loadingText: {
        marginTop: 12,
        color: "#64748B",
        fontSize: 16,
    },
    recipesContainer: {
        paddingBottom: 40,
    },
    recipeRow: {
        justifyContent: "space-between",
        marginBottom: 16,
    },
    recipeCard: {
        width: 200,
        height: 200,
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        marginHorizontal: 4,
    },
    imageContainer: {
        position: "relative",
        height: 120,
    },
    recipeImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    recipeImagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },
    imageOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        flexDirection: "row",
        gap: 6,
    },
    editIconButton: {
        backgroundColor: "rgba(99, 102, 241, 0.9)",
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteIconButton: {
        backgroundColor: "rgba(239, 68, 68, 0.9)",
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    recipeInfo: {
        padding: 12,
        flex: 1,
        justifyContent: "center",
    },
    recipeTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1E293B",
        textAlign: "center",
        lineHeight: 18,
    },
    recipeCategory: {
        fontSize: 12,
        color: "#6366F1",
        textAlign: "center",
        marginTop: 4,
        fontWeight: "500",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#374151",
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
    },
    saveButton: {
        backgroundColor: "#6366F1",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    formContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    formSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: "#F9FAFB",
        color: "#1F2937",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    textAreaLarge: {
        height: 120,
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },
    imageSelector: {
        height: 200,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        borderStyle: "dashed",
        borderRadius: 12,
        overflow: "hidden",
    },
    selectedImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
    },
    placeholderText: {
        marginTop: 8,
        color: "#9CA3AF",
        fontSize: 14,
    },
    // Image Picker Modal
    imageModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    imageModalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: "70%",
    },
    imageModalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    imageModalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
    },
    imageGrid: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    imageOption: {
        flex: 1,
        margin: 8,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#F9FAFB",
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedImageOption: {
        borderColor: "#6366F1",
    },
    imageOptionImage: {
        width: "100%",
        height: 100,
        resizeMode: "cover",
    },
    imageOptionText: {
        padding: 8,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
    },
    selectedOverlay: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 2,
    },
});