import React, { useEffect, useState, useContext } from "react";
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
    Modal,
} from "react-native";
import { Search, Bell, MessageCircle, Moon, Sun } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { db } from "@/config/firebaseConfig";
import { collection, query, orderBy, onSnapshot, where, getDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTheme } from '@/context/ThemeContext';
import { FavoritesContext } from './Favorites';


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

type UserDoc = {
    uid: string;
    fullName?: string;
    email?: string;
    role?: string;
    photoURL?: string | null;
};

const ASSET_IMAGES = [
    { id: 1, name: "Milk Rice", source: require("../../assets/images/rice & curry/kribath.jpg") },
    { id: 2, name: "Polos Curry", source: require("../../assets/images/rice & curry/polos.jpg") },
    { id: 3, name: "Kokis", source: require("../../assets/images/sweets/kokis.jpg") },
    { id: 4, name: "chiken", source: require("../../assets/images/meet/b9bbb6d8962047236122c4f46d8ca0e4.jpg") },
    { id: 5, name: "issowade", source: require("../../assets/images/streetFoods/issiwade.jpg") },
    { id: 6, name: "kalupol", source: require("../../assets/images/vegr/04086f9f2b47ae7357f33cb802b534bc.jpg") },
    { id: 7, name: "cutlut", source: require("../../assets/images/streetFoods/56711cde3cf86f455aa5d2ae59c5f5c8.jpg") },
];

const Home = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const { theme, toggleTheme, colors } = useTheme();

    // Use Favorites Context instead of local state
    const { favoriteRecipes, toggleFavorite } = useContext(FavoritesContext);

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showRecipeDetail, setShowRecipeDetail] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserDoc | null>(null);

    // const saveRecipeAsPDF = async (recipe: Recipe) => {
    //     try {
    //         // Android storage permission request
    //         if (Platform.OS === 'android') {
    //             const granted = await PermissionsAndroid.request(
    //                 PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //                 {
    //                     title: "Storage Permission",
    //                     message: "App needs access to your storage to save PDF",
    //                     buttonPositive: "OK"
    //                 }
    //             );
    //             if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //                 Alert.alert("Permission Denied", "Cannot save PDF without storage permission");
    //                 return;
    //             }
    //         }
    //
    //         // HTML content generate
    //         const htmlContent = `
    //         <h1>${recipe.title}</h1>
    //         ${recipe.description ? `<p>${recipe.description}</p>` : ""}
    //         ${recipe.ingredients ? `<h3>Ingredients</h3><ul>${recipe.ingredients.split('\n').map(i => `<li>${i}</li>`).join('')}</ul>` : ""}
    //         ${recipe.instructions ? `<h3>Instructions</h3><ol>${recipe.instructions.split('\n').map(i => `<li>${i}</li>`).join('')}</ol>` : ""}
    //     `;
    //
    //         const options = {
    //             html: htmlContent,
    //             fileName: recipe.title.replace(/\s/g, "_"),
    //             directory: 'Download', // Download folder on device
    //         };
    //
    //
    //         Alert.alert("Success", `PDF downloaded to: ${file.filePath}`);
    //         console.log("PDF Path:", file.filePath);
    //
    //     } catch (error) {
    //         console.error("Error saving PDF:", error);
    //         Alert.alert("Error", "Failed to save PDF");
    //     }
    // };


    const categories = [
        { name: "Rice & Curry", image: "https://i.pinimg.com/736x/27/58/ca/2758ca3713057831e725c6ba5b9d9f4b.jpg" },
        { name: "Snacks & Street Food", image: "https://i.pinimg.com/1200x/50/9d/0f/509d0f89c71b4154db31e563872751e0.jpg" },
        { name: "Seafood & Meat", image: "https://i.pinimg.com/736x/79/9c/25/799c25ee0f46f6dd328ebb9ea8396bd4.jpg" },
        { name: "Sweets & Desserts", image: "https://i.pinimg.com/736x/a9/06/f8/a906f8c16c19085fcc1f974032d72eed.jpg" },
        { name: "Vegetarian & Healthy", image: "https://i.pinimg.com/1200x/f0/7c/5a/f07c5a46b6a3072e36a457b495bb827b.jpg" },
    ];

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
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
        });

        return () => unsubscribe();
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
            return image ? { source: image.source } : null;
        }
        if (recipe.imageUrl) {
            return { source: { uri: recipe.imageUrl } };
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
                <SafeAreaView style={[styles.detailContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                        <TouchableOpacity
                            onPress={closeRecipeDetail}
                            style={[styles.backButton, { backgroundColor: colors.placeholder }]}
                        >
                            <Icon name="arrow-back" size={24} color={colors.icon} />
                        </TouchableOpacity>
                        <Text style={[styles.detailHeaderTitle, { color: colors.text }]}>Recipe Details</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.detailImageContainer}>
                            {imageSource ? (
                                <Image
                                    source={imageSource.source}
                                    style={styles.detailImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.detailImagePlaceholder, { backgroundColor: colors.placeholder }]}>
                                    <Icon name="restaurant-menu" size={60} color={colors.emptyState} />
                                    <Text style={[styles.detailNoImageText, { color: colors.emptyState }]}>No Image Available</Text>
                                </View>
                            )}
                            {selectedRecipe.category && (
                                <View style={[styles.detailCategoryBadge, { backgroundColor: colors.categoryBadge }]}>
                                    <Text style={[styles.detailCategoryText, { color: colors.categoryBadgeText }]}>
                                        {selectedRecipe.category}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.detailInfo}>
                            <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedRecipe.title}</Text>

                            {selectedRecipe.description && (
                                <Text style={[styles.detailDescription, { color: colors.textSecondary }]}>
                                    {selectedRecipe.description}
                                </Text>
                            )}

                            <View style={[styles.detailStats, { backgroundColor: colors.surface }]}>
                                <View style={styles.detailStatItem}>
                                    <Icon name="schedule" size={20} color={colors.statText} />
                                    <Text style={[styles.detailStatText, { color: colors.statText }]}>30 minutes</Text>
                                </View>
                                <View style={styles.detailStatItem}>
                                    <Icon name="people" size={20} color={colors.statText} />
                                    <Text style={[styles.detailStatText, { color: colors.statText }]}>2-4 servings</Text>
                                </View>
                                <View style={styles.detailStatItem}>
                                    <Icon name="star" size={20} color="#F59E0B" />
                                    <Text style={[styles.detailStatText, { color: colors.statText }]}>4.5/5</Text>
                                </View>
                            </View>

                            {selectedRecipe.ingredients && (
                                <View style={styles.detailSection}>
                                    <View style={styles.detailSectionHeader}>
                                        <Icon name="shopping-cart" size={20} color={colors.primary} />
                                        <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Ingredients</Text>
                                    </View>
                                    <View style={[styles.ingredientsContainer, { backgroundColor: colors.surface }]}>
                                        {selectedRecipe.ingredients.split('\n').map((ingredient, index) => (
                                            ingredient.trim() && (
                                                <View key={index} style={styles.ingredientItem}>
                                                    <View style={[styles.ingredientBullet, { backgroundColor: colors.primary }]} />
                                                    <Text style={[styles.ingredientText, { color: colors.text }]}>{ingredient.trim()}</Text>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                </View>
                            )}

                            {selectedRecipe.instructions && (
                                <View style={styles.detailSection}>
                                    <View style={styles.detailSectionHeader}>
                                        <Icon name="list-alt" size={20} color={colors.secondary} />
                                        <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Instructions</Text>
                                    </View>
                                    <View style={[styles.instructionsContainer, { backgroundColor: colors.surface }]}>
                                        {selectedRecipe.instructions.split('\n').map((instruction, index) => (
                                            instruction.trim() && (
                                                <View key={index} style={styles.instructionItem}>
                                                    <View style={[styles.instructionNumber, { backgroundColor: colors.secondary }]}>
                                                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                                                    </View>
                                                    <Text style={[styles.instructionText, { color: colors.text }]}>
                                                        {instruction.trim()}
                                                    </Text>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                >
                                    <Icon name="bookmark" size={20} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save Recipe</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.shareButton, { borderColor: colors.primary }]}>
                                    <Icon name="share" size={20} color={colors.primary} />
                                    <Text style={[styles.shareButtonText, { color: colors.primary }]}>Share</Text>
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
        const isFavorite = favoriteRecipes.find(r => r.rid === item.rid);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card }]}
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
                        <View style={[styles.placeholder, { backgroundColor: colors.placeholder }]}>
                            <Icon name="restaurant-menu" size={40} color={colors.emptyState} />
                            <Text style={[styles.noImageText, { color: colors.emptyState }]}>No Image</Text>
                        </View>
                    )}

                    {item.category && (
                        <View style={[styles.categoryBadge, { backgroundColor: colors.categoryBadge }]}>
                            <Text style={[styles.categoryBadgeText, { color: colors.categoryBadgeText }]}>
                                {item.category}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: colors.categoryBadge,
                            padding: 6,
                            borderRadius: 20,
                        }}
                        onPress={() => toggleFavorite(item)}
                    >
                        <Icon
                            name={isFavorite ? "favorite" : "favorite-border"}
                            size={20}
                            color={isFavorite ? "#EF4444" : colors.statText}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                    {item.description && (
                        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}

                    <View style={styles.recipeStats}>
                        <View style={styles.statItem}>
                            <Icon name="schedule" size={14} color={colors.statText} />
                            <Text style={[styles.statText, { color: colors.statText }]}>30 min</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="people" size={14} color={colors.statText} />
                            <Text style={[styles.statText, { color: colors.statText }]}>2-4 servings</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{
                            marginTop: 8,
                            bottom: 20,
                            backgroundColor: "transparent",
                            borderWidth: 1,
                            borderColor: colors.primary,
                            paddingVertical: 8,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                        }}
                        onPress={() => handleRecipePress(item)}
                    >
                        <Icon name="restaurant-menu" size={16} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontWeight: "600" }}>Recipe</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme === 'light' ? colors.primary : colors.headerGradient }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity>
                        <Image
                            source={{ uri: currentUser?.photoURL || "https://via.placeholder.com/150" }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 14 }}>
                        <Text style={styles.headerTitle}>Hello, {currentUser?.fullName || "Guest"}!</Text>
                        <Text style={[styles.headerSubtitle, { color: theme === 'light' ? '#D1D5DB' : colors.textSecondary }]}>
                            Welcome to TasteLanka 🇱🇰🌾
                        </Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={toggleTheme}
                    >
                        {theme === 'light' ? (
                            <Moon size={24} color="white" />
                        ) : (
                            <Sun size={24} color="white" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton}>
                        <Bell size={24} color="white" />
                        <View style={[styles.notificationDot, { backgroundColor: colors.notificationDot }]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton}>
                        <MessageCircle size={24} color="white" />
                        <View style={[styles.notificationDot, { backgroundColor: colors.messageDot }]} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.searchBar, { backgroundColor: colors.searchBar }]}>
                <Search size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="Search Any Recipe.."
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.searchInput, { color: colors.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Icon name="clear" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100, top: 50 }}>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary, marginBottom: 20, paddingHorizontal: 20 }]}>
                    Explore the rich and delicious flavors of Sri Lankan cuisine. Find your favorite dishes and try something new!
                </Text>

                <View style={{ marginBottom: 20, paddingHorizontal: 20 }}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
                        <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                            <Text style={[styles.linkText, { color: colors.primary }]}>See All</Text>
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
                                        borderColor: colors.primary,
                                    },
                                ]}
                                onPress={() =>
                                    setSelectedCategory(
                                        selectedCategory === category.name ? null : category.name
                                    )
                                }
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri: category.image }}
                                    style={styles.categoryImage}
                                    resizeMode="cover"
                                />
                                <View style={[styles.categoryOverlay, { backgroundColor: colors.overlay }]}>
                                    <Text style={styles.categoryText}>{category.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ paddingHorizontal: 20 }}>
                    <View style={styles.recipesHeader}>
                        <Text style={[styles.sectionTitle, { marginBottom: 0, color: colors.text }]}>
                            {selectedCategory ? `${selectedCategory} Recipes` : "All Recipes"}
                        </Text>
                        <Text style={[styles.recipeCount, { color: colors.textSecondary }]}>
                            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    {filteredRecipes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="search-off" size={48} color={colors.emptyState} />
                            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                                {searchQuery ? "No recipes found" : "No recipes available"}
                            </Text>
                            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                                {searchQuery
                                    ? `Try searching for something else or clear your search`
                                    : "Add some recipes to get started"
                                }
                            </Text>
                            {searchQuery && (
                                <TouchableOpacity
                                    style={[styles.clearSearchButton, { backgroundColor: colors.primary }]}
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

            {renderRecipeDetail()}
        </SafeAreaView>
    );
};

export default Home;

// Styles remain the same...
const styles = StyleSheet.create({
    container: { flex: 1, top: 30 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        height: 170,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", top: 2 },
    avatar: { width: 60, height: 60, borderRadius: 25, bottom: 30 },
    headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700", bottom: 30 },
    headerSubtitle: { fontSize: 16, bottom: 25 },
    headerRight: { flexDirection: "row", alignItems: "center", bottom: 20 },
    iconButton: { marginLeft: 16, position: "relative" },
    notificationDot: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#fff",
    },
    searchBar: {
        position: 'absolute',
        left: 16,
        right: 16,
        top: 130,
        flexDirection: "row",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
    },
    searchInput: { flex: 1, fontSize: 16 },
    sectionDescription: { fontSize: 14, marginBottom: 10, lineHeight: 20 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "bold" },
    linkText: { fontSize: 14, fontWeight: "600" },
    categoryCard: { width: 120, height: 80, borderRadius: 12, overflow: "hidden", marginRight: 16 },
    categoryImage: { width: "100%", height: "100%" },
    categoryOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
    categoryText: { color: "white", fontSize: 12, fontWeight: "bold", textAlign: "center" },
    recipesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    recipeCount: { fontSize: 14, fontWeight: "500" },
    image: { width: "100%", height: "100%" },
    placeholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
    noImageText: { fontSize: 12, marginTop: 4 },
    categoryBadge: { position: "absolute", top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    categoryBadgeText: { fontSize: 10, fontWeight: "600" },
    statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    statText: { fontSize: 11, fontWeight: "500" },
    list: { paddingBottom: 20 },
    emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 40 },
    emptyStateTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8 },
    emptyStateSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    clearSearchButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
    clearSearchButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    detailContainer: { flex: 1 },
    detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingTop: 50, borderBottomWidth: 1 },
    backButton: { padding: 8, borderRadius: 8 },
    detailHeaderTitle: { fontSize: 18, fontWeight: "600" },
    detailContent: { flex: 1 },
    detailImageContainer: { position: "relative", height: 250 },
    detailImage: { width: "100%", height: "100%" },
    detailImagePlaceholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
    detailNoImageText: { fontSize: 16, marginTop: 8 },
    detailCategoryBadge: { position: "absolute", top: 16, right: 16, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
    detailCategoryText: { fontSize: 12, fontWeight: "600" },
    detailInfo: { padding: 20 },
    detailTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
    detailDescription: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
    detailStats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 24, padding: 16, borderRadius: 12, elevation: 2 },
    detailStatItem: { alignItems: "center", gap: 4 },
    detailStatText: { fontSize: 14, fontWeight: "500" },
    detailSection: { marginBottom: 24 },
    detailSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    detailSectionTitle: { fontSize: 18, fontWeight: "600" },
    ingredientsContainer: { padding: 16, borderRadius: 12, elevation: 2 },
    ingredientItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
    ingredientBullet: { width: 6, height: 6, borderRadius: 3 },
    ingredientText: { fontSize: 14, flex: 1 },
    instructionsContainer: { padding: 16, borderRadius: 12, elevation: 2 },
    instructionItem: { flexDirection: "row", gap: 12, paddingVertical: 8 },
    instructionNumber: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    instructionNumberText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
    instructionText: { fontSize: 14, flex: 1, lineHeight: 20 },
    actionButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
    saveButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
    saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    shareButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
    shareButtonText: { fontSize: 14, fontWeight: "600" },
    card: {
        flex: 1,
        margin: 6,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        height: 290,
        maxWidth: '48%',
        minWidth: 150,
    },
    imageContainer: { position: "relative", height: 130, width: '100%' },
    cardContent: { padding: 12, height: 160, justifyContent: 'space-between', flex: 1 },
    title: { fontWeight: "700", fontSize: 16, marginBottom: 4, height: 35, textAlignVertical: 'top' },
    description: { fontSize: 12, lineHeight: 16, marginBottom: 8, height: 30, textAlignVertical: 'top' },
    recipeStats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, height: 20, bottom: 8 },
});