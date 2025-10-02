// services/authService.ts
import { auth, db } from "@/config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

import * as WebBrowser from "expo-web-browser";
import * as Google from 'expo-auth-session/providers/google';

import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({
  scheme: 'tastlanka',
  useProxy: true,
});

console.log(redirectUri);


// -------------------------
// Email Signup
// -------------------------
export const signUp = async (fullName: string, email: string, password: string): Promise<User | null> => {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName,
      email,
      role: "user",
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Signup Error:", error);
    return null;
  }
};

// -------------------------
// Email Login
// -------------------------
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred.user;
  } catch (error) {
    console.error("Login Error:", error);
    return null;
  }
};

// -------------------------
// Google Login (Expo AuthSession)
// -------------------------
export const useGoogleLogin = () => {



  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "298683022690-euv27fhskbq5qvk9coge9hh5lrc0qcak.apps.googleusercontent.com",
    expoClientId: "298683022690-euv27fhskbq5qvk9coge9hh5lrc0qcak.apps.googleusercontent.com",
  });

  const handleGoogleLogin = async (): Promise<User | null> => {
    try {
      if (response?.type === "success") {
        const { authentication } = response;
        if (!authentication?.idToken) return null;

        const credential = GoogleAuthProvider.credential(authentication.idToken);
        const userCred = await signInWithCredential(auth, credential);
        const user = userCred.user;

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            fullName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "user",
            createdAt: new Date(),
          });
        }

        return user;
      }
      return null;
    } catch (error) {
      console.error("Google Login Error:", error);
      return null;
    }
  };

  return { request, response, promptAsync, handleGoogleLogin };
};
