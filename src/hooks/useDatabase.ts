"use client";

import { useState, useEffect, useCallback } from "react";
import { getFirestore } from "firebase/firestore";
import app from "@/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { AccountData } from "@/utils/getLensProfile";

const db = getFirestore(app);

const usersCollection = collection(db, "users");
const addressToUserDoc = doc(usersCollection, "address-to-user");

interface UseDatabase {
  addressToUser: { [address: string]: AccountData };
  addAddressToUser: (address: string, accountData: AccountData) => void;
}

const normalizeAddressMap = (rawMap: { [address: string]: AccountData } | undefined) => {
  if (!rawMap) {
    return {};
  }

  return Object.entries(rawMap).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {} as { [address: string]: AccountData }
  );
};

const useDatabase = (): UseDatabase => {
  const [addressToUser, setAddressToUser] = useState<{ [address: string]: AccountData }>({});

  useEffect(() => {
    const fetchAddressToUser = async () => {
      const docSnap = await getDoc(addressToUserDoc);
      if (docSnap.exists()) {
        const normalized = normalizeAddressMap(docSnap.data() as { [address: string]: AccountData });
        setAddressToUser(normalized);
      }
    };
    fetchAddressToUser();
  }, []);

  const addAddressToUser = useCallback(async (address: string, accountData: AccountData) => {
    if (!address) {
      return;
    }
    const normalizedAddress = address.toLowerCase();
    const docSnap = await getDoc(addressToUserDoc);
    let currentDoc = {};
    if (docSnap.exists()) {
      currentDoc = normalizeAddressMap(docSnap.data() as { [address: string]: AccountData });
    }
    const existing = (currentDoc as { [address: string]: AccountData })[normalizedAddress];
    const unchanged =
      existing &&
      existing.displayName === accountData.displayName &&
      existing.handle === accountData.handle &&
      existing.picture === accountData.picture &&
      existing.userLink === accountData.userLink &&
      existing.address === accountData.address;

    if (unchanged) {
      return;
    }

    const newAddressToUser = { ...currentDoc, [normalizedAddress]: accountData };
    await setDoc(addressToUserDoc, newAddressToUser);
    setAddressToUser(newAddressToUser);
  }, []);

  return { addressToUser, addAddressToUser };
};

export default useDatabase;
