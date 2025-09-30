import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Recipe } from "@/types/Recipe";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react-native";

interface FavoritesContextType {
    favoriteRecipes: Recipe[];
    toggleFavorite: (recipe: Recipe) => void;
}

export const FavoritesContext = createContext<FavoritesContextType>({
    favoriteRecipes: [],
    toggleFavorite: () => {},
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);

    const toggleFavorite = (recipe: Recipe) => {
        setFavoriteRecipes(prev => {
            const exists = prev.find(r => r.rid === recipe.rid);
            if (exists) return prev.filter(r => r.rid !== recipe.rid);
            return [...prev, recipe];
        });
    };

    return (
        <FavoritesContext.Provider value={{ favoriteRecipes, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Asset Images (same as Home)
const ASSET_IMAGES = [
    { id: 1, name: "Milk Rice", source: require("../../assets/images/rice & curry/kribath.jpg") },
    { id: 2, name: "Polos Curry", source: require("../../assets/images/rice & curry/polos.jpg") },
    { id: 3, name: "Kokis", source: require("../../assets/images/sweets/kokis.jpg") },
    { id: 4, name: "chiken", source: require("../../assets/images/meet/b9bbb6d8962047236122c4f46d8ca0e4.jpg") },
    { id: 5, name: "issowade", source: require("../../assets/images/streetFoods/issiwade.jpg") },
    { id: 6, name: "kalupol", source: require("../../assets/images/vegr/04086f9f2b47ae7357f33cb802b534bc.jpg") },
    { id: 7, name: "cutlut", source: require("../../assets/images/streetFoods/56711cde3cf86f455aa5d2ae59c5f5c8.jpg") },
];

// 2️⃣ Favorites Screen
const FavoritesScreen = () => {
    const { favoriteRecipes, toggleFavorite } = useContext(FavoritesContext);
    const { theme, toggleTheme, colors } = useTheme();

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

    const handleRecipePress = (item: Recipe) => {
        console.log("View recipe:", item.title);
    };

    const renderRecipeCard = ({ item }: { item: Recipe }) => {
        const imageSource = getRecipeImageSource(item);

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
                        style={[styles.favoriteButton, { backgroundColor: colors.categoryBadge }]}
                        onPress={() => toggleFavorite(item)}
                    >
                        <Icon name="favorite" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Favorite Recipes</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {favoriteRecipes.length} {favoriteRecipes.length === 1 ? 'recipe' : 'recipes'} saved
                </Text>
            </View>

            {/* Content */}
            {favoriteRecipes.length === 0 ? (
                <View style={styles.emptyState}>
                    <Icon name="favorite-border" size={80} color={colors.emptyState} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        No favorite recipes yet
                    </Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Start adding recipes to your favorites by tapping the heart icon on any recipe card.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favoriteRecipes}
                    keyExtractor={(item) => item.rid!}
                    renderItem={renderRecipeCard}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Floating Theme Toggle Button */}
            <TouchableOpacity
                style={[styles.themeButton, { backgroundColor: colors.primary }]}
                onPress={toggleTheme}
                activeOpacity={0.8}
            >
                {theme === "light" ? (
                    <Moon size={24} color="#fff" />
                ) : (
                    <Sun size={24} color="#fff" />
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default FavoritesScreen;

// 3️⃣ Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: "500",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
    listContent: {
        padding: 10,
        paddingBottom: 100,
    },
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
    imageContainer: {
        position: "relative",
        height: 130,
        width: '100%'
    },
    image: {
        width: "100%",
        height: "100%",
    },
    placeholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noImageText: {
        marginTop: 4,
        fontSize: 12,
    },
    categoryBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: "600",
    },
    favoriteButton: {
        position: "absolute",
        top: 8,
        right: 8,
        padding: 6,
        borderRadius: 20,
    },
    cardContent: {
        padding: 12,
        height: 160,
        justifyContent: 'space-between',
        flex: 1
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
        height: 35,
        textAlignVertical: 'top'
    },
    description: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 8,
        height: 30,
        textAlignVertical: 'top'
    },
    recipeStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        height: 20,
        bottom: 8
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statText: {
        fontSize: 11,
        fontWeight: "500",
    },
    themeButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        padding: 16,
        borderRadius: 28,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
});