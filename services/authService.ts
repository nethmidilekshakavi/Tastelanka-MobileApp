import { app } from "@/config/firebaseConfig";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const DEFAULT_PROFILE_PIC =
  "https://firebasestorage.googleapis.com/v0/b/your-app-id.appspot.com/o/default_profile.png?alt=media";

export const register = async (fullName: string, email: string, password: string, profilePic?: string | null) => {
  // create user
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  // split name
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");

  // upload profile image (if user selected)
  let photoURL = DEFAULT_PROFILE_PIC;
  if (profilePic) {
    const imgRef = ref(storage, `profilePics/${userCred.user.uid}.jpg`);
    const img = await fetch(profilePic);
    const bytes = await img.blob();
    await uploadBytes(imgRef, bytes);
    photoURL = await getDownloadURL(imgRef);
  }

  // update firebase auth profile
  await updateProfile(userCred.user, {
    displayName: fullName,
    photoURL,
  });

  // save to firestore
  await setDoc(doc(db, "users", userCred.user.uid), {
    uid: userCred.user.uid,
    firstName,
    lastName,
    email,
    photoURL,
    createdAt: new Date(),
  });

  return userCred.user;
};
