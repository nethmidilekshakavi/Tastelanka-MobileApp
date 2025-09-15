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
    Dimensions,
} from "react-native";
import { Recipe } from "@/types/Recipe";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from '@react-native-picker/picker';
import {Category} from "@/types/Category";

const ASSET_IMAGES = [
    { id: 1, name: "Rice & Curry", source: require("../assets/images/fac132dbf73ecd95071f6da669ce7f15.jpg") },
    { id: 2, name: "Milk Rice", source: require("../assets/images/rice & curry/kribath.jpg") },
];

const { width: screenWidth } = Dimensions.get('window');
// Adjusted card width calculation for better spacing
const numColumns = screenWidth > 768 ? 3 : 2;
const cardMargin = 10;
const totalMargin = cardMargin * 2 * numColumns + 60; // slightly bigger padding
const cardWidth = 360; // fixed width 60px


export const RecipeManagement = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
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
        if (!recipe.rid) {
            Alert.alert("Error", "Recipe ID is undefined!");
            return;
        }

        try {
            const recipeRef = doc(db, "recipes", recipe.rid);
            await deleteDoc(recipeRef);
            if (selectedRecipe?.rid === recipe.rid) cancelEdit();
            Alert.alert("Success", "Recipe deleted successfully!");
        } catch (error) {
            console.error("Error deleting recipe:", error);
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
        setShowDetailModal(false);
        setShowForm(true);
    };

    const openDetailView = (recipe: Recipe) => {
        setDetailRecipe(recipe);
        setShowDetailModal(true);
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

    const renderRecipeCard = ({ item }) => {
        const imageSource = getRecipeImageSource(item);

        return (
            <View style={[styles.modernRecipeCard, { width: cardWidth }]}>
                {/* Recipe Image Container - Fixed height and proper image handling */}
                <View style={styles.modernImageContainer}>
                    <TouchableOpacity
                        onPress={() => openDetailView(item)}
                        activeOpacity={0.9}
                        style={styles.imageContainer}
                    >
                        {imageSource ? (
                            <Image
                                source={imageSource}
                                style={styles.modernRecipeImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.modernImagePlaceholder}>
                                <Icon name="restaurant-menu" size={40} color="#9CA3AF" />
                                <Text style={styles.noImageText}>No Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Category Badge - Positioned over image */}
                    <View style={styles.categoryBadgeOverlay}>
                        <Text style={styles.categoryBadgeOverlayText}>
                            {item.category || "Uncategorized"}
                        </Text>
                    </View>

                    {/* Action Buttons - Positioned over image */}
                    <View style={styles.modernActionButtons}>
                        <TouchableOpacity
                            style={styles.modernEditButton}
                            onPress={() => openEdit(item)}
                        >
                            <Icon name="edit" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modernDeleteButton}
                            onPress={() => confirmDelete(item)}
                        >
                            <Icon name="delete" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recipe Info */}
                <View style={styles.modernRecipeInfo}>
                    <Text style={styles.modernRecipeTitle} numberOfLines={2}>
                        {item.title}
                    </Text>

                    <Text style={styles.modernRecipeDescription} numberOfLines={2}>
                        {item.description || "A delightful recipe perfect for any occasion."}
                    </Text>

                    {/* Recipe Stats */}
                    <View style={styles.recipeStats}>
                        <View style={styles.statItem}>
                            <Icon name="schedule" size={14} color="#6B7280" />
                            <Text style={styles.statText}>30 min</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="people" size={14} color="#6B7280" />
                            <Text style={styles.statText}>2 servings</Text>
                        </View>
                    </View>

                    {/* View Recipe Button */}
                    <TouchableOpacity
                        style={styles.viewRecipeButton}
                        onPress={() => openDetailView(item)}
                    >
                        <Icon name="visibility" size={16} color="#fff" />
                        <Text style={styles.viewRecipeButtonText}>View Recipe</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Recipes</Text>
                    <Text style={styles.headerSubtitle}>{recipes.length} delicious recipes</Text>
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
                    numColumns={numColumns}
                    scrollEnabled={false}
                    contentContainerStyle={styles.modernRecipesContainer}
                    columnWrapperStyle={numColumns > 1 ? styles.row : null}
                    renderItem={renderRecipeCard}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="restaurant-menu" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No recipes yet</Text>
                            <Text style={styles.emptySubtitle}>Add your first recipe to get started</Text>
                            <TouchableOpacity style={styles.emptyAddButton} onPress={openAddForm}>
                                <Text style={styles.emptyAddButtonText}>Add Recipe</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </ScrollView>

            {/* Recipe Detail Modal */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setShowDetailModal(false)}
            >
                <SafeAreaView style={styles.detailContainer}>
                    <View style={styles.detailHeader}>
                        <TouchableOpacity
                            onPress={() => setShowDetailModal(false)}
                            style={styles.closeButton}
                        >
                            <Icon name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.detailHeaderTitle}>Recipe Details</Text>
                        <View style={styles.detailActions}>
                            <TouchableOpacity
                                style={styles.detailEditButton}
                                onPress={() => detailRecipe && openEdit(detailRecipe)}
                            >
                                <Icon name="edit" size={20} color="#3B82F6" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.detailDeleteButton}
                                onPress={() => detailRecipe && confirmDelete(detailRecipe)}
                            >
                                <Icon name="delete" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
                        {detailRecipe && (
                            <>
                                <View style={styles.detailImageSection}>
                                    {getRecipeImageSource(detailRecipe) ? (
                                        <Image
                                            source={getRecipeImageSource(detailRecipe)}
                                            style={styles.detailImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={styles.detailImagePlaceholder}>
                                            <Icon name="restaurant-menu" size={60} color="#9CA3AF" />
                                            <Text style={styles.noImageText}>No Image Available</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.detailInfoSection}>
                                    <Text style={styles.detailTitle}>{detailRecipe.title}</Text>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryBadgeText}>{detailRecipe.category}</Text>
                                    </View>

                                    {detailRecipe.description && (
                                        <View style={styles.detailSection}>
                                            <Text style={styles.detailSectionTitle}>Description</Text>
                                            <Text style={styles.detailSectionContent}>{detailRecipe.description}</Text>
                                        </View>
                                    )}

                                    {detailRecipe.ingredients && (
                                        <View style={styles.detailSection}>
                                            <Text style={styles.detailSectionTitle}>Ingredients</Text>
                                            <Text style={styles.detailSectionContent}>{detailRecipe.ingredients}</Text>
                                        </View>
                                    )}

                                    {detailRecipe.instructions && (
                                        <View style={styles.detailSection}>
                                            <Text style={styles.detailSectionTitle}>Instructions</Text>
                                            <Text style={styles.detailSectionContent}>{detailRecipe.instructions}</Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

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
                                {selectedImageId && getSelectedImageSource() ? (
                                    <Image
                                        source={getSelectedImageSource()}
                                        style={styles.selectedImage}
                                        resizeMode="cover"
                                    />
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
                                    <Image
                                        source={item.source}
                                        style={styles.imageOptionImage}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.imageOptionText}>{item.name}</Text>
                                    {selectedImageId === item.id && (
                                        <View style={styles.selectedOverlay}>
                                            <Icon name="check-circle" size={20} color="#3B82F6" />
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
        backgroundColor: "#3B82F6",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: "#3B82F6",
        shadowOffset: {width: 0, height: 4},
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
    modernRecipesContainer: {
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    modernRecipeCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },
    modernImageContainer: {
        position: "relative",
        height: 180,
        backgroundColor: "#F1F5F9",
    },
    imageContainer: {
        width: "100%",
        height: "100%",
    },
    modernRecipeImage: {
        width: "100%",
        height: "100%",
    },
    modernImagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },
    noImageText: {
        color: "#9CA3AF",
        fontSize: 12,
        marginTop: 4,
    },
    categoryBadgeOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backdropFilter: "blur(10px)",
    },
    categoryBadgeOverlayText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#374151",
    },
    modernActionButtons: {
        position: "absolute",
        top: 8,
        left: 8,
        flexDirection: "row",
        gap: 6,
    },
    modernEditButton: {
        backgroundColor: "rgba(59, 130, 246, 0.9)",
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(10px)",
    },
    modernDeleteButton: {
        backgroundColor: "rgba(239, 68, 68, 0.9)",
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(10px)",
    },
    modernRecipeInfo: {
        padding: 16,
    },
    modernRecipeTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 6,
        lineHeight: 20,
    },
    modernRecipeDescription: {
        fontSize: 13,
        color: "#64748B",
        lineHeight: 18,
        marginBottom: 12,
    },
    recipeStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statText: {
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "500",
    },
    viewRecipeButton: {
        backgroundColor: "#3B82F6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 8,
        gap: 4,
    },
    viewRecipeButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#374151",
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 24,
    },
    emptyAddButton: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyAddButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    // Detail Modal Styles
    detailContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    detailHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    detailHeaderTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
    },
    detailActions: {
        flexDirection: "row",
        gap: 12,
    },
    detailEditButton: {
        padding: 8,
    },
    detailDeleteButton: {
        padding: 8,
    },
    detailContent: {
        flex: 1,
    },
    detailImage: {
        width: "100%",
        height: "100%",
    },
    detailImagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
    },
    detailInfoSection: {
        padding: 20,
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#EEF2FF",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: 20,
    },
    categoryBadgeText: {
        fontSize: 12,
        color: "#3B82F6",
        fontWeight: "600",
    },
    detailSection: {
        marginBottom: 24,
    },
    detailSectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 8,
    },
    detailSectionContent: {
        fontSize: 16,
        color: "#64748B",
        lineHeight: 24,
    },
    // Modern Detail View Styles
    detailHeroSection: {
        height: 400,
        position: "relative",
        backgroundColor: "#1F2937",
    },
    detailHeroImage: {
        width: "100%",
        height: "100%",
    },
    detailHeroPlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1F2937",
    },
    heroOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 24,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 12,
        lineHeight: 38,
    },
    heroCategoryBadge: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backdropFilter: "blur(10px)",
    },
    heroCategoryText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    recipeInfoCard: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        marginTop: -30,
        borderRadius: 24,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    descriptionSection: {
        marginBottom: 32,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    descriptionText: {
        fontSize: 16,
        color: "#6B7280",
        lineHeight: 26,
        textAlign: "left",
    },
    twoColumnContainer: {
        flexDirection: "row",
        gap: 32,
        marginBottom: 32,
    },
    leftColumn: {
        flex: 1,
    },
    rightColumn: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 20,
    },
    ingredientsList: {
        gap: 12,
    },
    ingredientItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 4,
    },
    ingredientBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#3B82F6",
        marginTop: 8,
        marginRight: 12,
    },
    ingredientText: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 22,
        flex: 1,
    },
    instructionsList: {
        gap: 16,
    },
    instructionStep: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    instructionText: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 22,
        flex: 1,
    },
    noDataText: {
        fontSize: 14,
        color: "#9CA3AF",
        fontStyle: "italic",
    },
    printButton: {
        backgroundColor: "#3B82F6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 8,
        shadowColor: "#3B82F6",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    printButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    // Form Modal Styles
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
        backgroundColor: "#3B82F6",
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
        borderColor: "#3B82F6",
    },
    imageOptionImage: {
        width: "100%",
        height: 100,
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