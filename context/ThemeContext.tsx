// ============================================
// 1. IMPORTS - අවශ්‍ය packages import කරනවා
// ============================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


// ============================================
// 2. TYPE DEFINITIONS - Data types define කරනවා
// ============================================
type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;                    // දැනට active theme එක
    toggleTheme: () => void;         // Theme switch කරන function
    colors: typeof lightColors;      // Color palette එක
}


// ============================================
// 3. LIGHT MODE COLORS - ආලෝකමත් mode වර්ණ
// ============================================
const lightColors = {
    background: '#F8FAFC',              // Main පසුබිම
    surface: '#FFFFFF',                 // Cards, modals
    primary: '#4CAF50',                 // ප්‍රධාන හරිත වර්ණය
    secondary: '#10B981',               // දෙවන වර්ණය
    text: '#1F2937',                    // ප්‍රධාන text වර්ණය
    textSecondary: '#6B7280',           // දෙවන text වර්ණය
    textTertiary: '#9CA3AF',            // තෙවන text වර්ණය
    border: '#E5E7EB',                  // Border වර්ණය
    error: '#EF4444',                   // Error වර්ණය
    card: '#FFFFFF',                    // Card පසුබිම
    shadow: '#000000',                  // Shadow වර්ණය
    placeholder: '#F1F5F9',             // Placeholder වර්ණය
    overlay: 'rgba(0,0,0,0.4)',        // Dark overlay
    headerGradient: '#4CAF50',          // Header වර්ණය
    notificationDot: '#EF4444',         // Notification dot
    messageDot: '#34D399',              // Message dot
    categoryBadge: 'rgba(255, 255, 255, 0.95)',  // Category badge පසුබිම
    categoryBadgeText: '#374151',       // Category badge text
    statText: '#6B7280',                // Stats text වර්ණය
    icon: '#374151',                    // Icon වර්ණය
    searchBar: '#FFFFFF',               // Search bar පසුබිම
    buttonBorder: '#4CAF50',            // Button border වර්ණය
    emptyState: '#9CA3AF',              // Empty state icon වර්ණය
};


// ============================================
// 4. DARK MODE COLORS - අඳුරු mode වර්ණ
// ============================================
const darkColors = {
    background: '#0F172A',              // අඳුරු නිල් පසුබිම
    surface: '#1E293B',                 // Cards, modals අඳුරු පසුබිම
    primary: '#4CAF50',                 // එකම හරිත වර්ණය (consistency)
    secondary: '#10B981',               // දෙවන වර්ණය
    text: '#F1F5F9',                    // ලා text (අඳුරු mode සඳහා)
    textSecondary: '#CBD5E1',           // දෙවන text වර්ණය
    textTertiary: '#64748B',            // තෙවන text වර්ණය
    border: '#334155',                  // අඳුරු border
    error: '#F87171',                   // ලා error වර්ණය
    card: '#1E293B',                    // අඳුරු card පසුබිම
    shadow: '#000000',                  // Shadow වර්ණය
    placeholder: '#334155',             // අඳුරු placeholder
    overlay: 'rgba(0,0,0,0.6)',        // වඩා අඳුරු overlay
    headerGradient: '#1E293B',          // අඳුරු header
    notificationDot: '#F87171',         // ලා notification dot
    messageDot: '#34D399',              // Message dot (එකම වර්ණය)
    categoryBadge: 'rgba(30, 41, 59, 0.95)',  // අඳුරු category badge
    categoryBadgeText: '#F1F5F9',       // ලා category text
    statText: '#94A3B8',                // අඳුරු stats text
    icon: '#F1F5F9',                    // ලා icons
    searchBar: '#1E293B',               // අඳුරු search bar
    buttonBorder: '#4CAF50',            // Button border (එකම වර්ණය)
    emptyState: '#64748B',              // අඳුරු empty state
};


// ============================================
// 5. CONTEXT CREATION
// ============================================
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


// ============================================
// 6. THEME PROVIDER COMPONENT - Main provider
// ============================================
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // System theme එක detect කරනවා (phone settings එකෙන්)
    const systemColorScheme = useColorScheme();

    // State - දැනට තියෙන theme එක store කරනවා
    const [theme, setTheme] = useState<Theme>('light');

    // App load වෙද්දී saved theme එක load කරනවා
    useEffect(() => {
        loadTheme();
    }, []);

    // ============================================
    // 7. LOAD THEME FUNCTION
    // ============================================
    const loadTheme = async () => {
        try {
            // AsyncStorage එකෙන් saved theme එක ගන්නවා
            const savedTheme = await AsyncStorage.getItem('theme');

            if (savedTheme) {
                // Saved theme එකක් තියෙනවා නම් use කරනවා
                setTheme(savedTheme as Theme);
            } else {
                // නැත්නම් system theme එක use කරනවා
                setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    // ============================================
    // 8. TOGGLE THEME FUNCTION - Theme switch කරනවා
    // ============================================
    const toggleTheme = async () => {
        try {
            // Light නම් dark කරනවා, dark නම් light කරනවා
            const newTheme = theme === 'light' ? 'dark' : 'light';

            // State update කරනවා
            setTheme(newTheme);

            // AsyncStorage එකේ save කරනවා (next time සඳහා)
            await AsyncStorage.setItem('theme', newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    // ============================================
    // 9. COLOR SELECTION - Active theme එකට colors select කරනවා
    // ============================================
    const colors = theme === 'light' ? lightColors : darkColors;

    // ============================================
    // 10. PROVIDER RETURN - Children වලට theme provide කරනවා
    // ============================================
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};


// ============================================
// 11. CUSTOM HOOK - useTheme hook export කරනවා
// ============================================
export const useTheme = () => {
    const context = useContext(ThemeContext);

    // Provider එක එළියෙන් use කරනවා නම් error දෙනවා
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
};