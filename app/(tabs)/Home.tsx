import React, {useEffect, useRef} from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Dimensions,
} from "react-native";
import { Search, Bell, Heart, Compass, Star, User } from "lucide-react-native";
import { router } from "expo-router";

const Home = () => {
    const categories = [
        {
            name: "Main Meals",
            image: "https://i.pinimg.com/736x/27/58/ca/2758ca3713057831e725c6ba5b9d9f4b.jpg",
        },
        {
            name: "Side Dishes & Curries",
            image: "https://i.pinimg.com/1200x/c1/07/94/c107947d0872bf34e97a6799afc70d88.jpg",
        },
        {
            name: "Vegetarian & Healthy",
            image: "https://i.pinimg.com/1200x/9c/85/f0/9c85f0d4e0e27df0567c6ff7a9a9f5a0.jpg",
        },
        {
            name: "Snacks & Short Eats",
            image: "https://i.pinimg.com/1200x/c4/3b/5f/c43b5f231abc4a7156ba15afe65e0612.jpg",
        },
        {
            name: "Sweets & Desserts",
            image: "https://i.pinimg.com/736x/a9/06/f8/a906f8c16c19085fcc1f974032d72eed.jpg",
        },
        {
            name: "Beverages",
            image: "https://i.pinimg.com/1200x/91/16/66/9116665b1a86dd8562ebbf4b4b48f855.jpg",
        },
        {
            name: "Traditional & Festival Specials",
            image: "https://i.pinimg.com/736x/a6/7c/41/a67c41fbd83a88e82e8538ef30723267.jpg",
        },
    ];

    const recipes = [
        {
            title: "Burst Tomato Pasta",
            meta: "🕐 35 min • Easy • by Arieme McCoy",
            image: "https://i.pinimg.com/1200x/f5/9b/8b/f59b8b96b8a8df92e310d01ca2211c3f.jpg",
        },
        {
            title: "Spicy Chicken Curry",
            meta: "🕐 50 min • Medium • by Saman Perera",
            image: "https://i.pinimg.com/1200x/63/cc/47/63cc47493fa3862bde2ac25c805de614.jpg",
        },
        {
            title: "Coconut Sambol",
            meta: "🕐 10 min • Easy • by Nadeesha",
            image: "https://i.pinimg.com/1200x/29/75/d6/2975d6a4f9e6963da24f773898eab7f3.jpg",
        },
    ];


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/Profile")}>
                        <Image
                            source={{
                                uri: "https://images.unsplash.com/photo-1494790108755-2616c75a3b75?w=40&h=40&fit=crop&crop=face",
                            }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Hello, Jenny!</Text>
                        <Text style={styles.headerSub}>Welcome to TasteLanka 🇱🇰</Text>
                        <Text style={styles.headerSubtitle}>Check Amazing Recipes</Text>
                    </View>
                </View>
                <View style={{ position: "relative" }}>
                    <Bell size={24} color="white" />
                    <View style={styles.notificationDot} />
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Search size={20} color="gray" style={{ marginRight: 8 }} />
                <TextInput placeholder="Search Any Recipe.." style={styles.searchInput} />
            </View>


            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Categories */}
                <View style={{ marginBottom: 20, paddingHorizontal: 20 }}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map((category, index) => (
                            <View key={index} style={[styles.categoryCard, { marginRight: 20 }]}>
                                <Image source={{ uri: category.image }} style={styles.categoryImage} />
                                <View style={styles.categoryOverlay}>
                                    <Text style={styles.categoryText}>{category.name}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <Text></Text>

                {/* Popular Recipes */}
                <View style={{ marginBottom: 20, paddingHorizontal: 20 ,height:370}}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Recipes</Text>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {recipes.map((recipe, index) => (
                            <View
                                key={index}
                                style={[styles.recipeCard, { marginRight: index === recipes.length - 1 ? 0 : 20 }]}
                            >
                                <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                                <View style={styles.recipeInfo}>
                                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                                    <Text style={styles.recipeMeta}>{recipe.meta}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },

    searchBar: {
        flexDirection: "row",
        backgroundColor: "white",
        margin: 16,
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        elevation: 2,
    },
    searchInput: { flex: 1, fontSize: 14 },
    section: { marginBottom: 20 },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
    linkText: { color: "orange" },
    categoryCard: {
        width: 100,
        height: 70,
        borderRadius: 10,
        overflow: "hidden",
    },
    categoryImage: { width: "100%", height: "100%" },
    categoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    categoryText: { color: "white", fontSize: 12, fontWeight: "bold" },
    recipeCard: {
        borderRadius: 12,
        backgroundColor: '#4CAF50', // light green background
        elevation: 3,
        overflow: "hidden",
        width: 350,
        height:220
    },
    recipeImage: { width: "100%", height: 140 },
    recipeInfo: { padding: 10 },
    recipeTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 4, color:"white" },
    recipeMeta: { color: "white", fontSize: 12 },
    header: {
        flexDirection: "row",
        top:"5%",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20, // increase horizontal padding
        paddingVertical: 15,
        width: "100%", // make sure header takes full width
        height:"20%",
        borderTopEndRadius:"10%",
        borderTopStartRadius:"10%",
        backgroundColor: "#4CAF50", // example color
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15, // space between avatar and text
        width: "70%", // increase the space it can take
    },
    avatar: {
        width: 50, // make avatar bigger if you want
        height: 50,
        borderRadius: 25,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    headerSub:{
        fontSize: 17,
        top:10,
        fontWeight: "bold",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 14,
        top:10,
        color: "#fff",
    },
    notificationDot: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "red",
    },

    text: {
        color: '#fff',
        fontSize: 24,
    },
    card: {
        width: 200,
        height: 150,
        borderRadius: 20,
        marginRight: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: 'hidden', // important to keep image inside rounded corners
    },
    image: {
        width: '100%',
        height: 180,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginHorizontal: 10,
    },
    subtitle: {
        fontSize: 14,
        color: 'gray',
        marginHorizontal: 10,
        marginTop: 5,
    },
});

