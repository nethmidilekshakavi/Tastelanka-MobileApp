import React from "react"
import "./../global.css"
import { Slot, Stack } from "expo-router"
import { AuthProvider } from "@/context/AuthContext"; // Correct path
import { LoaderProvider } from "@/context/LoaderContext"

const RootLayout = () => {
  return (
    <LoaderProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </LoaderProvider>
  )
}

export default RootLayout
