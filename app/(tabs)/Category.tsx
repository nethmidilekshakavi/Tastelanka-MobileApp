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
import Icon from "react-native-vector-icons/MaterialIcons";
import { db } from "@/config/firebaseConfig";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useRoute, useNavigation } from "@react-navigation/native";

interface Recipe {
    rid?: string;
    title: string;
    category?: string;
    imageUrl?: string;
    description?: string;
}

const Category = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { categoryName, categoryImage } = route.params;

    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "recipes"),
            where('categories', "==", categoryName),
            orderBy("title")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
                rid: doc.id,
                ...doc.data(),
            })) as Recipe[];
            setRecipes(list);
        });

        return () => unsubscribe();
    }, [categoryName]);

    const renderRecipeCard = ({ item }: { item: Recipe }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <Image
                source={{ uri: item.imageUrl || "https://via.placeholder.com/150/ccc/fff?text=No+Image" }}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description || "No description"}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                {/* Category Banner */}
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: categoryImage }} style={styles.bannerImage} />
                    <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerText}>{categoryName}</Text>
                    </View>
                </View>

                {/* Recipes */}
                <View style={styles.recipeListContainer}>
                    {recipes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="search-off" size={50} color="#9CA3AF" />
                            <Text style={styles.emptyTitle}>No Recipes Found</Text>
                            <Text style={styles.emptySubtitle}>
                                This category doesn’t have any recipes yet.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={recipes}
                            keyExtractor={(item) => item.rid!}
                            renderItem={renderRecipeCard}
                            numColumns={2}
                            columnWrapperStyle={{ justifyContent: "space-between" }}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Category;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#4CAF50",
        padding: 16,
    },
    backBtn: { padding: 6, backgroundColor: "#3B823F", borderRadius: 20 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },

    bannerContainer: { width: "100%", height: 180, position: "relative" },
    bannerImage: { width: "100%", height: "100%" },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    bannerText: { fontSize: 22, fontWeight: "bold", color: "#fff" },

    recipeListContainer: { padding: 16 },

    card: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 3,
    },
    cardImage: { width: "100%", height: 120 },
    cardContent: { padding: 8 },
    cardTitle: { fontSize: 14, fontWeight: "bold", color: "#1E293B" },
    cardDesc: { fontSize: 12, color: "#6B7280" },

    emptyState: { alignItems: "center", marginTop: 60 },
    emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151", marginTop: 8 },
    emptySubtitle: { fontSize: 14, color: "#9CA3AF", textAlign: "center", marginTop: 4 },
});
