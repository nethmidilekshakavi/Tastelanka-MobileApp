import { db } from "@/config/firebaseConfig";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

export interface Category {
    id?: string; // Firestore auto-generates
    name: string;
}

// 🔹 Add new category
export const addCategory = async (name: string) => {
    const docRef = await addDoc(collection(db, "categories"), {
        name,
        createdAt: new Date(),
    });
    return docRef.id;
};

// 🔹 Get all categories
export const getCategories = async (): Promise<Category[]> => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Category, "id">),
    }));
};

// 🔹 Update category
export const updateCategory = async (id: string, name: string) => {
    const categoryRef = doc(db, "categories", id);
    await updateDoc(categoryRef, { name });
};

// 🔹 Delete category
export const deleteCategory = async (id: string) => {
    const categoryRef = doc(db, "categories", id);
    await deleteDoc(categoryRef);
};
