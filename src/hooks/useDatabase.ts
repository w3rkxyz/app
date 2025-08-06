import { useState, useEffect } from "react";
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

const useDatabase = (): UseDatabase => {
  const [addressToUser, setAddressToUser] = useState<{ [address: string]: AccountData }>({});

  useEffect(() => {
    const fetchAddressToUser = async () => {
      const docSnap = await getDoc(addressToUserDoc);
      if (docSnap.exists()) {
        setAddressToUser(docSnap.data());
      }
    };
    fetchAddressToUser();
  }, []);

  const addAddressToUser = async (address: string, accountData: AccountData) => {
    const docSnap = await getDoc(addressToUserDoc);
    var currentDoc = addressToUser;
    if (docSnap.exists()) {
      currentDoc = docSnap.data();
    }
    const newAddressToUser = { ...currentDoc, [address]: accountData };
    await setDoc(addressToUserDoc, newAddressToUser);
    setAddressToUser(newAddressToUser);
  };

  return { addressToUser, addAddressToUser };
};

export default useDatabase;
