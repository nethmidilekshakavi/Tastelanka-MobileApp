import React, { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextType {
    isUser: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isUser, setIsUser] = useState(false);

    const login = () => setIsUser(true);
    const logout = () => setIsUser(false);

    return (
        <AuthContext.Provider value={{ isUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
