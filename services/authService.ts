import { auth, db, storage } from "@/config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const DEFAULT_PROFILE_PIC =
    "https://i.pinimg.com/736x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";

export const register = async (fullName: string, email: string, password: string, profilePic?: string | null) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  let photoURL = DEFAULT_PROFILE_PIC;

  if (profilePic && !profilePic.startsWith("file://")) {
    try {
      const imgRef = ref(storage, `profilePics/${userCred.user.uid}.jpg`);
      const img = await fetch(profilePic);
      const bytes = await img.blob();
      await uploadBytes(imgRef, bytes);
      photoURL = await getDownloadURL(imgRef);
    } catch (err) {
      console.warn("Failed to upload profile pic, using default.", err);
    }
  }

  await updateProfile(userCred.user, { displayName: fullName, photoURL });

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
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
};
