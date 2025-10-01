import React from "react"
import "./../global.css"
import { Slot } from "expo-router"
import { AuthProvider } from "@/context/AuthContext"
import { LoaderProvider } from "@/context/LoaderContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { FavoritesProvider } from "@/app/(tabs)/Favorites";

const RootLayout = () => {
    return (
        <LoaderProvider>
            <AuthProvider>
                <ThemeProvider>
                    <FavoritesProvider>
                        <Slot />
                    </FavoritesProvider>
                </ThemeProvider>
            </AuthProvider>
        </LoaderProvider>
    )
}

export default RootLayout
