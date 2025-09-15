import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Modal, Alert,
} from "react-native";
import { Search, Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { db } from "@/config/firebaseConfig";
import { collection, query, orderBy, onSnapshot, where, getDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import {getAuth} from "firebase/auth";

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

const ASSET_IMAGES = [
    { id: 1, name: "Rice & Curry", source: require("../../assets/images/rice & curry/kribath.jpg") },
    { id: 2, name: "Milk Rice", source: require("../../assets/images/rice & curry/kribath.jpg") },
    { id: 3, name: "Polos Curry", source: require("../../assets/images/rice & curry/polos.jpg") },
    { id: 4, name: "Kokis", source: require("../../assets/images/sweets/kokis.jpg")},
];

type UserDoc = {
    uid: string;
    fullName?: string;
    email?: string;
    role?: string;
    photoURL?: string | null;
};

const Home = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showRecipeDetail, setShowRecipeDetail] = useState(false);
    const [users, setUsers] = useState<UserDoc[]>([]);


    const categories = [
        { name: "Rice & Curry", image: "https://i.pinimg.com/736x/27/58/ca/2758ca3713057831e725c6ba5b9d9f4b.jpg" },
        { name: "Snacks & Street Food", image: "https://i.pinimg.com/1200x/9c/85/f0/9c85f0d4e0e27df0567c6ff7a9a9f5a0.jpg" },
        { name: "Seafood & Meat", image: "https://i.pinimg.com/1200x/c1/07/94/c107947d0872bf34e97a6799afc70d88.jpg" },
        { name: "Sweets & Desserts", image: "https://i.pinimg.com/736x/a9/06/f8/a906f8c16c19085fcc1f974032d72eed.jpg" },
        { name: "Vegetarian & Healthy", image: "https://i.pinimg.com/1200x/c4/3b/5f/c43b5f231abc4a7156ba15afe65e0612.jpg" },
    ];


    const [currentUser, setCurrentUser] = useState<UserDoc | null>(null);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const userRef = doc(db, "users", user.uid);
            getDoc(userRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setCurrentUser({ uid: snapshot.id, ...(snapshot.data() as UserDoc) });
                    }
                })
                .catch((err) => {
                    console.error("Error fetching user profile:", err);
                });
        }
    }, []);

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
            const list = snapshot.docs.map((doc) => ({ rid: doc.id, ...doc.data() })) as Recipe[];
            setRecipes(list);
        });

        return () => unsubscribe();
    }, [selectedCategory]);

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

    const handleRecipePress = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setShowRecipeDetail(true);
    };

    const closeRecipeDetail = () => {
        setShowRecipeDetail(false);
        setSelectedRecipe(null);
    };

    const renderRecipeDetail = () => {
        if (!selectedRecipe) return null;

        const imageSource = getRecipeImageSource(selectedRecipe);

        return (
            <Modal
                visible={showRecipeDetail}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeRecipeDetail}
            >
                <SafeAreaView style={styles.detailContainer}>
                    {/* Header */}
                    <View style={styles.detailHeader}>
                        <TouchableOpacity
                            onPress={closeRecipeDetail}
                            style={styles.backButton}
                        >
                            <Icon name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.detailHeaderTitle}>Recipe Details</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
                        {/* Recipe Image */}
                        <View style={styles.detailImageContainer}>
                            {imageSource ? (
                                <Image
                                    source={imageSource.source}
                                    style={styles.detailImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.detailImagePlaceholder}>
                                    <Icon name="restaurant-menu" size={60} color="#9CA3AF" />
                                    <Text style={styles.detailNoImageText}>No Image Available</Text>
                                </View>
                            )}
                            {selectedRecipe.category && (
                                <View style={styles.detailCategoryBadge}>
                                    <Text style={styles.detailCategoryText}>{selectedRecipe.category}</Text>
                                </View>
                            )}
                        </View>

                        {/* Recipe Info */}
                        <View style={styles.detailInfo}>
                            <Text style={styles.detailTitle}>{selectedRecipe.title}</Text>

                            {selectedRecipe.description && (
                                <Text style={styles.detailDescription}>{selectedRecipe.description}</Text>
                            )}

                            {/* Recipe Stats */}
                            <View style={styles.detailStats}>
                                <View style={styles.detailStatItem}>
                                    <Icon name="schedule" size={20} color="#6B7280" />
                                    <Text style={styles.detailStatText}>30 minutes</Text>
                                </View>
                                <View style={styles.detailStatItem}>
                                    <Icon name="people" size={20} color="#6B7280" />
                                    <Text style={styles.detailStatText}>2-4 servings</Text>
                                </View>
                                <View style={styles.detailStatItem}>
                                    <Icon name="star" size={20} color="#F59E0B" />
                                    <Text style={styles.detailStatText}>4.5/5</Text>
                                </View>
                            </View>

                            {/* Ingredients */}
                            {selectedRecipe.ingredients && (
                                <View style={styles.detailSection}>
                                    <View style={styles.detailSectionHeader}>
                                        <Icon name="shopping-cart" size={20} color="#3B82F6" />
                                        <Text style={styles.detailSectionTitle}>Ingredients</Text>
                                    </View>
                                    <View style={styles.ingredientsContainer}>
                                        {selectedRecipe.ingredients.split('\n').map((ingredient, index) => (
                                            ingredient.trim() && (
                                                <View key={index} style={styles.ingredientItem}>
                                                    <View style={styles.ingredientBullet} />
                                                    <Text style={styles.ingredientText}>{ingredient.trim()}</Text>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Instructions */}
                            {selectedRecipe.instructions && (
                                <View style={styles.detailSection}>
                                    <View style={styles.detailSectionHeader}>
                                        <Icon name="list-alt" size={20} color="#10B981" />
                                        <Text style={styles.detailSectionTitle}>Instructions</Text>
                                    </View>
                                    <View style={styles.instructionsContainer}>
                                        {selectedRecipe.instructions.split('\n').map((instruction, index) => (
                                            instruction.trim() && (
                                                <View key={index} style={styles.instructionItem}>
                                                    <View style={styles.instructionNumber}>
                                                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                                                    </View>
                                                    <Text style={styles.instructionText}>{instruction.trim()}</Text>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.saveButton}>
                                    <Icon name="bookmark" size={20} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save Recipe</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.shareButton}>
                                    <Icon name="share" size={20} color="#3B82F6" />
                                    <Text style={styles.shareButtonText}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        );
    };

    const renderRecipeCard = ({ item }: { item: Recipe }) => {
        const imageSource = getRecipeImageSource(item);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleRecipePress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    {imageSource ? (
                        <Image
                            source={imageSource.source}
                            style={styles.image}
                            resizeMode="cover"
                        />
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
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    {item.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {item.description}
                        </Text>
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
            </TouchableOpacity>
        );
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/Profile")}>
                        <Image
                            source={{
                                uri: currentUser?.photoURL
                                    ? currentUser.photoURL
                                    : "https://via.placeholder.com/150/ccc/fff?text=User", // fallback
                            }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>
                            Hello, {currentUser?.fullName || "Guest"}!
                        </Text>
                        <Text style={styles.headerSub}>Welcome to TasteLanka 🇱🇰</Text>
                        <Text style={styles.headerSubtitle}>Check Amazing Recipes</Text>
                    </View>
                </View>
                <View style={{ position: "relative" }}>
                    <TouchableOpacity>
                        <Bell size={24} color="white" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>
            </View>


            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Search size={20} color="gray" style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="Search Any Recipe.."
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Icon name="clear" size={20} color="gray" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Categories */}
                <View style={{ marginBottom: 20, paddingHorizontal: 20 }}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                            <Text style={styles.linkText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map((category, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.categoryCard,
                                    {
                                        marginRight: 20,
                                        borderWidth: selectedCategory === category.name ? 3 : 0,
                                        borderColor: "#3B82F6",
                                    },
                                ]}
                                onPress={() =>
                                    setSelectedCategory(
                                        selectedCategory === category.name ? null : category.name
                                    )
                                }
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: category.image }} style={styles.categoryImage} />
                                <View style={styles.categoryOverlay}>
                                    <Text style={styles.categoryText}>{category.name}</Text>
                                    {selectedCategory === category.name && (
                                        <Icon name="check-circle" size={16} color="white" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Recipes Section */}
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={styles.recipesHeader}>
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                            {selectedCategory ? `${selectedCategory} Recipes` : "All Recipes"}
                        </Text>
                        <Text style={styles.recipeCount}>
                            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    {filteredRecipes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="search-off" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyStateTitle}>
                                {searchQuery ? "No recipes found" : "No recipes available"}
                            </Text>
                            <Text style={styles.emptyStateSubtitle}>
                                {searchQuery
                                    ? `Try searching for something else or clear your search`
                                    : "Add some recipes to get started"
                                }
                            </Text>
                            {searchQuery && (
                                <TouchableOpacity
                                    style={styles.clearSearchButton}
                                    onPress={() => setSearchQuery("")}
                                >
                                    <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <FlatList
                            data={filteredRecipes}
                            keyExtractor={(item) => item.rid!}
                            renderItem={renderRecipeCard}
                            numColumns={2}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Add Recipe Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("RecipeManagement")}
                activeOpacity={0.8}
            >
                <Icon name="add" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Recipe Detail Modal */}
            {renderRecipeDetail()}
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    searchBar: {
        flexDirection: "row",
        backgroundColor: "white",
        margin: 16,
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: { flex: 1, fontSize: 16, color: "#1F2937" },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
    linkText: { color: "#4CAF50", fontSize: 14, fontWeight: "600" },
    categoryCard: { width: 120, height: 80, borderRadius: 12, overflow: "hidden", marginRight: 16 },
    categoryImage: { width: "100%", height: "100%" },
    categoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 4
    },
    categoryText: { color: "white", fontSize: 12, fontWeight: "bold", textAlign: "center" },
    recipesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    recipeCount: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
    card: { flex: 1, backgroundColor: "#fff", margin: 6, borderRadius: 16, overflow: "hidden", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    imageContainer: { position: "relative", height: 140 },
    image: { width: "100%", height: "100%" },
    placeholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
    noImageText: { color: "#9CA3AF", fontSize: 12, marginTop: 4 },
    categoryBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255, 255, 255, 0.95)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    categoryBadgeText: { fontSize: 10, fontWeight: "600", color: "#374151" },
    cardContent: { padding: 12 },
    title: { fontWeight: "700", fontSize: 16, color: "#1E293B", marginBottom: 4 },
    description: { fontSize: 12, color: "#6B7280", lineHeight: 16, marginBottom: 8 },
    recipeStats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    statText: { fontSize: 11, color: "#6B7280", fontWeight: "500" },
    viewButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#EEF2FF", borderRadius: 8 },
    viewButtonText: { color: "#3B82F6", fontSize: 12, fontWeight: "600" },
    list: { paddingBottom: 20 },
    header: {height:150, flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#4CAF50", borderBottomLeftRadius: 20, borderBottomRightRadius: 20,top:30 },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    headerSub: { fontSize: 16, color: "#fff" },
    headerSubtitle: { fontSize: 14, color: "#E8F5E8" },
    notificationDot: { position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: "#EF4444" },
    addButton: { position: "absolute", bottom: 30, right: 20, backgroundColor: "#3B82F6", padding: 16, borderRadius: 28, elevation: 8, shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 40 },
    emptyStateTitle: { fontSize: 18, fontWeight: "600", color: "#374151", marginTop: 16, marginBottom: 8 },
    emptyStateSubtitle: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 20 },
    clearSearchButton: { backgroundColor: "#3B82F6", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
    clearSearchButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },

    // Recipe Detail Styles
    detailContainer: { flex: 1, backgroundColor: "#F8FAFC" },
    backButton: { padding: 8, borderRadius: 8, backgroundColor: "#F3F4F6" },
    detailHeaderTitle: { fontSize: 18, fontWeight: "600", color: "#374151" },
    detailHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        paddingTop: 36, // 16 + 20px top extra
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB"
    },
    detailContent: { flex: 1 },
    detailImageContainer: { position: "relative", height: 250 },
    detailImage: { width: "100%", height: "100%" },
    detailImagePlaceholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
    detailNoImageText: { color: "#9CA3AF", fontSize: 16, marginTop: 8 },
    detailCategoryBadge: { position: "absolute", top: 16, right: 16, backgroundColor: "rgba(255, 255, 255, 0.95)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
    detailCategoryText: { fontSize: 12, fontWeight: "600", color: "#374151" },
    detailInfo: { padding: 20 },
    detailTitle: { fontSize: 24, fontWeight: "bold", color: "#1E293B", marginBottom: 8 },
    detailDescription: { fontSize: 16, color: "#6B7280", lineHeight: 24, marginBottom: 20 },
    detailStats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 24, backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2 },
    detailStatItem: { alignItems: "center", gap: 4 },
    detailStatText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
    detailSection: { marginBottom: 24 },
    detailSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    detailSectionTitle: { fontSize: 18, fontWeight: "600", color: "#374151" },
    ingredientsContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2 },
    ingredientItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
    ingredientBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#3B82F6" },
    ingredientText: { fontSize: 14, color: "#374151", flex: 1 },
    instructionsContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2 },
    instructionItem: { flexDirection: "row", gap: 12, paddingVertical: 8 },
    instructionNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#10B981", justifyContent: "center", alignItems: "center" },
    instructionNumberText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
    instructionText: { fontSize: 14, color: "#374151", flex: 1, lineHeight: 20 },
    actionButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
    saveButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#3B82F6", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
    saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    shareButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#fff", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#3B82F6" },
    shareButtonText: { color: "#3B82F6", fontSize: 14, fontWeight: "600" },
});