import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Modal,
} from "react-native";
import { db } from "@/config/firebaseConfig";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Recipe {
    rid?: string;
    title: string;
    category?: string;
    imageUrl?: string;
    imageId?: number;
    description?: string;
    ingredients?: string;
    instructions?: string;
}

const categories = [
    { name: "Rice & Curry", image: "https://i.pinimg.com/736x/27/58/ca/2758ca3713057831e725c6ba5b9d9f4b.jpg" },
    { name: "Snacks & Street Food", image: "https://i.pinimg.com/1200x/50/9d/0f/509d0f89c71b4154db31e563872751e0.jpg" },
    { name: "Seafood & Meat", image: "https://i.pinimg.com/736x/79/9c/25/799c25ee0f46f6dd328ebb9ea8396bd4.jpg" },
    { name: "Sweets & Desserts", image: "https://i.pinimg.com/736x/a9/06/f8/a906f8c16c19085fcc1f974032d72eed.jpg" },
    { name: "Vegetarian & Healthy", image: "https://i.pinimg.com/1200x/f0/7c/5a/f07c5a46b6a3072e36a457b495bb827b.jpg" },
];

const ASSET_IMAGES = [
    { id: 1, name: "Milk Rice", source: require("../../assets/images/rice & curry/kribath.jpg") },
    { id: 2, name: "Polos Curry", source: require("../../assets/images/rice & curry/polos.jpg") },
    { id: 3, name: "Kokis", source: require("../../assets/images/sweets/kokis.jpg") },
    { id: 4, name: "chiken", source: require("../../assets/images/meet/b9bbb6d8962047236122c4f46d8ca0e4.jpg")},
    { id: 5, name: "issowade", source: require("../../assets/images/streetFoods/issiwade.jpg")},
    { id: 6, name: "kalupol", source: require("../../assets/images/vegr/04086f9f2b47ae7357f33cb802b534bc.jpg")},
    { id: 7, name: "cutlut", source: require("../../assets/images/streetFoods/56711cde3cf86f455aa5d2ae59c5f5c8.jpg")},



];

const getRecipeImageSource = (recipe: Recipe) => {
    if (recipe.imageId) {
        const image = ASSET_IMAGES.find(img => img.id === recipe.imageId);
        return image ? { source: image.source, isLocal: true } : null;
    }
    if (recipe.imageUrl) {
        return { source: { uri: recipe.imageUrl }, isLocal: false };
    }
    return null;
};

const CategoryPage = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        let q;
        if (selectedCategory) {
            q = query(
                collection(db, "recipes"),
                where("category", "==", selectedCategory),
                orderBy("title")
            );
        } else {
            q = query(collection(db, "recipes"), orderBy("title"));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
                rid: doc.id,
                ...(doc.data() as Recipe),
            }));
            setRecipes(list);
        });

        return () => unsubscribe();
    }, [selectedCategory]);

    const handleRecipePress = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setModalVisible(true);
    };

    const renderCategoryCard = (category: { name: string; image: string }) => (
        <TouchableOpacity
            key={category.name}
            style={styles.categoryCard}
            onPress={() =>
                setSelectedCategory(selectedCategory === category.name ? null : category.name)
            }
            activeOpacity={0.8}
        >
            <Image source={{ uri: category.image }} style={styles.categoryImage} />
            <View style={styles.categoryOverlay}>
                <Text style={styles.categoryText}>{category.name}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderRecipeCard = ({ item }: { item: Recipe }) => {
        const imageSource = getRecipeImageSource(item);

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.imageContainer}
                    activeOpacity={0.7}
                    onPress={() => handleRecipePress(item)}
                >
                    {imageSource ? (
                        <Image source={imageSource.source} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholder}>
                            <Icon name="restaurant-menu" size={40} color="#9CA3AF" />
                            <Text style={styles.noImageText}>No Image</Text>
                        </View>
                    )}
                    {item.category && (
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{item.category}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.cardContent}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    {item.description && (
                        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                    )}

                    <View style={styles.recipeStats}>
                        <View style={styles.statItem}>
                            <Icon name="schedule" size={14} color="#6B7280" />
                            <Text style={styles.statText}>30 min</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="people" size={14} color="#6B7280" />
                            <Text style={styles.statText}>2-4 servings</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => handleRecipePress(item)}
                    >
                        <Icon name="visibility" size={16} color="#3B82F6" />
                        <Text style={styles.viewButtonText}>View Recipe</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Taste Lanka Recipes</Text>
                <Text style={styles.headerSubtitle}>Choose your favorite foods 🇱🇰🍽️ </Text>
            </View>

            <ScrollView>
                {/* Categories */}
                <View style={{ padding: 20 }}>{categories.map(renderCategoryCard)}</View>

                {/* Recipes */}
                <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                    <Text style={styles.sectionTitle}>
                        {selectedCategory ? `${selectedCategory} Recipes` : "All Recipes"}
                    </Text>
                    {recipes.length === 0 ? (
                        <Text style={{ marginTop: 20, color: "#555" }}>No recipes found.</Text>
                    ) : (
                        <FlatList
                            data={recipes}
                            keyExtractor={(item) => item.rid!}
                            renderItem={renderRecipeCard}
                            scrollEnabled={false} // inside ScrollView
                        />
                    )}
                </View>
            </ScrollView>

            {/* Modal for Recipe Details */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            {selectedRecipe?.imageUrl && (
                                <Image source={{ uri: selectedRecipe.imageUrl }} style={styles.modalImage} resizeMode="cover" />
                            )}
                            <Text style={styles.modalTitle}>{selectedRecipe?.title}</Text>
                            {selectedRecipe?.category && (
                                <Text style={styles.modalCategory}>{selectedRecipe.category}</Text>
                            )}
                            {selectedRecipe?.description && (
                                <Text style={styles.modalDescription}>{selectedRecipe.description}</Text>
                            )}
                            {selectedRecipe?.ingredients && (
                                <>
                                    <Text style={styles.modalSectionTitle}>Ingredients:</Text>
                                    <Text style={styles.modalText}>{selectedRecipe.ingredients}</Text>
                                </>
                            )}
                            {selectedRecipe?.instructions && (
                                <>
                                    <Text style={styles.modalSectionTitle}>Instructions:</Text>
                                    <Text style={styles.modalText}>{selectedRecipe.instructions}</Text>
                                </>
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CategoryPage;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC", top: 30 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    categoryCard: { width: "100%", height: 120, borderRadius: 12, overflow: "hidden", marginBottom: 15 },
    categoryImage: { width: "100%", height: "100%" },
    categoryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
    categoryText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    card: { flex: 1, backgroundColor: "#fff", margin: 6, borderRadius: 16, overflow: "hidden", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    imageContainer: { position: "relative", height: 140 },
    image: { width: "100%", height: "100%" },
    placeholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
    noImageText: { color: "#9CA3AF", fontSize: 12, marginTop: 4 },
    categoryBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    categoryBadgeText: { fontSize: 10, fontWeight: "600", color: "#374151" },
    cardContent: { padding: 12 },
    title: { fontWeight: "700", fontSize: 16, color: "#1E293B", marginBottom: 4 },
    description: { fontSize: 12, color: "#6B7280", lineHeight: 16, marginBottom: 8 },
    recipeStats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    statText: { fontSize: 11, color: "#6B7280", fontWeight: "500" },
    viewButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#EEF2FF", borderRadius: 8 },
    viewButtonText: { color: "#3B82F6", fontSize: 12, fontWeight: "600" },
    modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { width: "90%", maxHeight: "80%", backgroundColor: "#fff", borderRadius: 16, padding: 16 },
    modalImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 12 },
    modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
    modalCategory: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
    modalDescription: { fontSize: 14, color: "#374151", marginBottom: 8 },
    modalSectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 4 },
    modalText: { fontSize: 14, color: "#374151", marginBottom: 8 },
    modalCloseButton: { marginTop: 12, backgroundColor: "#3B82F6", padding: 10, borderRadius: 8, alignItems: "center" },
    modalCloseText: { color: "#fff", fontWeight: "600" },
    headerContainer: {
        padding: 20,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        color:"#fff",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 18,
        fontWeight: "400",
        color: "#fff",
        marginTop: 4,
    },


});
