import { View, Text } from 'react-native'
import React, { createContext, ReactNode, useContext, useState } from 'react'


const AuthContext = createContext<any>(null)


export const AuthProvider = ({children} : {children : ReactNode}) => {

const [isUser,setIsUser] = useState(false)

const login = () => setIsUser(true)

const logout = () => setIsUser(false)


  return (
    <AuthContext.Provider value={{isUser,login,logout}}>{children}</AuthContext.Provider>
)
}

export const useAuth = () => {
    return useContext(AuthContext)
}


//export kranna puluwan eka deyk vithri
// export default authProvider

// //obj ekk return kranwa meken kranne js obj ekk hadanwa 
// export {authProvider} 