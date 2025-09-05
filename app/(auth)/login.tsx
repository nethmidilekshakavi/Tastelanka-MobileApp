import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    Alert,
    ActivityIndicator,
    Image,
    ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "@/services/authService";
import { Video } from "expo-av"; // <-- import Video from expo-av
// @ts-ignore
import videoFile from "../../assets/vidios/PinDown.io_@kamkumarasinghe_1756743322.mp4";
import {getDoc} from "@firebase/firestore";
import {doc} from "firebase/firestore";
import {db} from "@/config/firebaseConfig";
// import image from "../../assets/images/fac132dbf73ecd95071f6da669ce7f15.jpg";


const LoginScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogin = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const user = await login(email, password); // Firebase auth login
            console.log("Login success:", user);

            // firestore users collection එකෙන් role එක ගන්න
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (userData?.role === "admin") {
                router.push("../components/AdminDashBoard.tsx");
            } else {
                router.push("/(tabs)/Home");
            }

        } catch (err) {
            console.error(err);
            Alert.alert("Login failed", "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <View className="flex-1 bg-gradient-to-br from-green-100 to-green-50">
            {/* Top curved section with image */}
            <View className="relative">
                <ImageBackground
                    source={{
                        uri: "https://i.pinimg.com/1200x/c8/11/e1/c811e16e296b7830943b90943a3d5c51.jpg",
                    }}
                    className="h-80 rounded-b-[50px] justify-center items-center overflow-hidden"
                    resizeMode="cover"
                >
                    <View className="absolute inset-0 opacity-50" />
                    <View className="absolute top-10 right-10 w-32 h-32 bg-green-400 rounded-full opacity-20" />
                    <View className="absolute top-20 left-5 w-20 h-20 bg-green-600 rounded-full opacity-30" />
                    <Text className="text-white text-3xl font-bold mb-2">
                        Welcome Back TasteLanka !
                    </Text>
                    <Text className="text-green-100 text-lg">SIGN IN</Text>
                </ImageBackground>
            </View>

            {/* Bottom white section with form */}
            <View className="flex-1 bg-white mx-6 -mt-10 rounded-t-[30px] px-6 pt-10 shadow-lg">
                {/* Email Input */}
                <View className="mb-6">
                    <TextInput
                        placeholder="Email"
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-800 text-lg"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password Input */}
                <View className="mb-8">
                    <TextInput
                        placeholder="Password"
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-800 text-lg"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    className="bg-green-500 py-4 rounded-2xl mb-6 shadow-md"
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="large" />
                    ) : (
                        <Text className="text-center text-xl text-white font-semibold">
                            LOGIN
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Social Media Buttons */}
                <View className="flex-row justify-center space-x-4 mb-8">
                    <TouchableOpacity className="w-12 h-12 rounded-full justify-center items-center bg-gray-100">
                        <Image
                            source={{
                                uri: "https://i.pinimg.com/736x/7b/ed/39/7bed398644d61cae7c4dd853b558a1c9.jpg",
                            }}
                            className="w-6 h-6"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity className="w-12 h-12 rounded-full justify-center items-center bg-gray-100">
                        <Image
                            source={{
                                uri: "https://i.pinimg.com/1200x/60/41/99/604199df880fb029291ddd7c382e828b.jpg",
                            }}
                            className="w-6 h-6"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity className="w-12 h-12 rounded-full justify-center items-center bg-gray-100">
                        <Image
                            source={{
                                uri: "https://i.pinimg.com/736x/b5/66/fa/b566fa1473df5b662b54babb764a46f2.jpg",
                            }}
                            className="w-6 h-6"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                {/* Register Link */}
                <Pressable
                    onPress={() => router.push("/register")}
                    className="items-center"
                >
                    <Text className="text-gray-600 text-base">
                        Don't have an account?{" "}
                        <Text className="text-green-500 font-semibold">Register</Text>
                    </Text>
                </Pressable>

                 Video
                <View className="mt-4 w-full h-48">
                    <Video
                        source={videoFile}      // use local video
                        style={{ width: "100%", height: 230,  borderRadius: 12 }}
                        useNativeControls
                        resizeMode="cover"
                        isLooping
                        shouldPlay              // auto play
                    />

                </View>
                {/*<View className="mt-4 w-full h-48">*/}
                {/*    <Image*/}
                {/*        source={image} // replace with your local image path*/}
                {/*        style={{ width: "100%", height: 260, borderRadius: 12 }}*/}
                {/*        resizeMode="cover" // cover ensures the image fills the view nicely*/}
                {/*    />*/}
                {/*</View>*/}
            </View>
        </View>
    );
};

export default LoginScreen;
