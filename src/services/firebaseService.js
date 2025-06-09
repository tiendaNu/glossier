import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const getProductos = async () => {
  try {
    const productosCol = collection(db, "productos");
    const productosSnapshot = await getDocs(productosCol);
    const productosList = productosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return productosList;
  } catch (error) {
    console.error("Error al obtener productos de Firebase:", error);
    throw error;
  }
};

export const agregarProducto = async (producto) => {
  try {
    const productosCol = collection(db, "productos");
    const docRef = await addDoc(productosCol, producto);
    return { id: docRef.id, ...producto };
  } catch (error) {
    console.error("Error al agregar producto:", error);
    throw error;
  }
};

export const editarProducto = async (id, producto) => {
  try {
    if (!producto || Object.keys(producto).length === 0) {
      throw new Error("No se proporcionaron datos para actualizar");
    }
    const productoRef = doc(db, "productos", id);
    await updateDoc(productoRef, producto);
    return { id, ...producto };
  } catch (error) {
    console.error(`Error al editar producto con id ${id}:`, error);
    throw error;
  }
};

export const eliminarProducto = async (id) => {
  try {
    const productoRef = doc(db, "productos", id);
    await deleteDoc(productoRef);
    return true;
  } catch (error) {
    console.error(`Error al eliminar producto con id ${id}:`, error);
    throw error;
  }
};
