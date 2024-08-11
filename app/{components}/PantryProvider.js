"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, query, getDocs, getDoc, setDoc, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { useSession } from "next-auth/react";
import { encodeUserIdentifier } from "../utils/encodeUserIdentifier";

const PantryContext = createContext();

export const usePantry = () => {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error("usePantry must be used within a PantryProvider");
  }
  return context;
};

export const PantryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/Pantry");
    },
  });

  const fetchInventory = async () => {
    if (session?.user) {
      const userCollection = encodeUserIdentifier(session.user.email, session.user.role);
      const snapshot = query(collection(firestore, `inventory-${userCollection}`));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      setInventory(inventoryList);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [session]);

  const addItem = async (itemName, category, description) => {
    if (session?.user) {
      const userCollection = encodeUserIdentifier(session.user.email, session.user.role);
      const docRef = doc(collection(firestore, `inventory-${userCollection}`), itemName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, category, description });
      } else {
        await setDoc(docRef, { quantity: 1, category, description });
      }
      fetchInventory();
    }
  };

  const removeItem = async (itemName) => {
    if (session?.user) {
      const userCollection = encodeUserIdentifier(session.user.email, session.user.role);
      const docRef = doc(collection(firestore, `inventory-${userCollection}`), itemName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
        fetchInventory();
      }
    }
  };

  return (
    <PantryContext.Provider value={{ inventory, addItem, removeItem }}>
      {children}
    </PantryContext.Provider>
  );
};
