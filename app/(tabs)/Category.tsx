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
} from "react-native";
import { db } from "@/config/firebaseConfig";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons"; // install react-native-vector-icons

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
    { name: "Snacks & Street Food", image: "https://i.pinimg.com/1200x/9c/85/f0/9c85f0d4e0e27df0567c6ff7a9a9f5a0.jpg" },
    { name: "Seafood & Meat", image: "https://i.pinimg.com/1200x/c1/07/94/c107947d0872bf34e97a6799afc70d88.jpg" },
    { name: "Sweets & Desserts", image: "https://i.pinimg.com/736x/a9/06/f8/a906f8c16c19085fcc1f974032d72eed.jpg" },
    { name: "Vegetarian & Healthy", image: "https://i.pinimg.com/1200x/c4/3b/5f/c43b5f231abc4a7156ba15afe65e0612.jpg" },
];

const ASSET_IMAGES = [
    { id: 1, name: "Rice & Curry", source: require("../../assets/images/rice & curry/kribath.jpg") },
    { id: 2, name: "Milk Rice", source: require("../../assets/images/rice & curry/kribath.jpg") },
    { id: 3, name: "Polos Curry", source: require("../../assets/images/rice & curry/polos.jpg") },
    { id: 4, name: "Kokis", source: require("../../assets/images/sweets/kokis.jpg") },
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
        console.log("Recipe clicked:", recipe.title);
        // You can navigate to a recipe detail page here
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
            <TouchableOpacity style={styles.recipeCard} onPress={() => handleRecipePress(item)}>
                {imageSource ? (
                    <Image source={imageSource.source} style={styles.recipeImage} />
                ) : (
                    <View style={[styles.recipeImage, { justifyContent: "center", alignItems: "center" }]}>
                        <Icon name="restaurant-menu" size={40} color="#9CA3AF" />
                        <Text>No Image</Text>
                    </View>
                )}
                <Text style={styles.recipeTitle}>{item.title}</Text>
                {item.description && <Text style={styles.recipeDesc}>{item.description}</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
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
        </SafeAreaView>
    );
};

export default CategoryPage;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    categoryCard: { width: "100%", height: 120, borderRadius: 12, overflow: "hidden", marginBottom: 15 },
    categoryImage: { width: "100%", height: "100%" },
    categoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    categoryText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    recipeCard: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 15, overflow: "hidden" },
    recipeImage: { width: "100%", height: 150 },
    recipeTitle: { fontSize: 16, fontWeight: "bold", padding: 8 },
    recipeDesc: { fontSize: 14, color: "#555", paddingHorizontal: 8, paddingBottom: 8 },
});
