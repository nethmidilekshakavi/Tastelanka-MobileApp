import { auth, db, storage } from "@/config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const DEFAULT_PROFILE_PIC =
    "https://firebasestorage.googleapis.com/v0/b/your-app-id.appspot.com/o/default_profile.png?alt=media";

export const register = async (fullName: string, email: string, password: string, profilePic?: string | null) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  // Upload profile pic if exists
  let photoURL = DEFAULT_PROFILE_PIC;
  if (profilePic) {
    const imgRef = ref(storage, `profilePics/${userCred.user.uid}.jpg`);
    const img = await fetch(profilePic);
    const bytes = await img.blob();
    await uploadBytes(imgRef, bytes);
    photoURL = await getDownloadURL(imgRef);
  }

  // Update Auth profile
  await updateProfile(userCred.user, { displayName: fullName, photoURL });

  // Save to Firestore
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
