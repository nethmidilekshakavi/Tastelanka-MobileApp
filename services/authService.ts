import { auth, db } from "@/config/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "./cloudinaryService";

const DEFAULT_PROFILE_PIC =
    "https://i.pinimg.com/736x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";

export const register = async (
    fullName: string,
    email: string,
    password: string,
    profilePic?: string | null
) => {
  // Create auth user
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  // Upload image to Cloudinary if exists
  let photoURL = DEFAULT_PROFILE_PIC;
  if (profilePic) {
    const uploadedURL = await uploadImageToCloudinary(profilePic);
    if (uploadedURL) photoURL = uploadedURL;
  }

  // Update Auth profile
  await updateProfile(userCred.user, {
    displayName: fullName,
    photoURL,
  });

  // Save user in Firestore
  await setDoc(doc(db, "users", userCred.user.uid), {
    uid: userCred.user.uid,
    fullName,
    email,
    photoURL,
    role: "user",
    createdAt: new Date(),
  });

  return userCred.user;
};

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};