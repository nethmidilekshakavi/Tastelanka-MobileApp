import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Recipe } from "@/types/Recipe";

// 1️⃣ Context Setup
interface FavoritesContextType {
    favoriteRecipes: Recipe[];
    toggleFavorite: (recipe: Recipe) => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
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

// 2️⃣ Favorites Screen
const FavoritesScreen = () => {
    const { favoriteRecipes, toggleFavorite } = useContext(FavoritesContext);

    const getRecipeImageSource = (item: Recipe) => {
        if (item.imageUrl) return { uri: item.imageUrl };
        return null;
    };

    const handleRecipePress = (item: Recipe) => {
        console.log("View recipe:", item.title);
    };

    const renderRecipeCard = ({ item }: { item: Recipe }) => {
        const imageSource = getRecipeImageSource(item);

        return (
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                    {imageSource ? (
                        <Image source={imageSource} style={styles.image} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Icon name="restaurant-menu" size={40} color="#9CA3AF" />
                            <Text style={styles.noImageText}>No Image</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => toggleFavorite(item)}
                    >
                        <Icon name="favorite" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.category && (
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{item.category}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.recipeButton}
                        onPress={() => handleRecipePress(item)}
                    >
                        <Icon name="restaurant-menu" size={16} color="#fff" />
                        <Text style={styles.recipeButtonText}>Recipe</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {favoriteRecipes.length === 0 ? (
                <Text style={styles.emptyText}>No favorite recipes yet.</Text>
            ) : (
                <FlatList
                    data={favoriteRecipes}
                    keyExtractor={(item) => item.rid!}
                    renderItem={renderRecipeCard}
                    numColumns={2}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

export default FavoritesScreen;

// 3️⃣ Styles
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
    emptyText: { fontSize: 16, color: "#6B7280", textAlign: "center", marginTop: 20 },
    card: { backgroundColor: "#fff", borderRadius: 10, margin: 8, flex: 1, elevation: 2 },
    imageContainer: { height: 120, borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: "hidden" },
    image: { width: "100%", height: "100%" },
    placeholder: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E5E7EB" },
    noImageText: { marginTop: 4, color: "#6B7280" },
    favoriteButton: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: 6,
        borderRadius: 20,
    },
    cardContent: { padding: 8 },
    title: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 4 },
    categoryBadge: { backgroundColor: "#D1D5DB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start", marginBottom: 6 },
    categoryBadgeText: { fontSize: 12, color: "#374151" },
    recipeButton: { backgroundColor: "#3B82F6", paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
    recipeButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});
