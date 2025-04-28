import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9h4A1HUqefXQFWji-P91CJAoocEacQpQ",
  authDomain: "w3rk-18ccc.firebaseapp.com",
  projectId: "w3rk-18ccc",
  storageBucket: "w3rk-18ccc.firebasestorage.app",
  messagingSenderId: "545283489131",
  appId: "1:545283489131:web:38f683d18a92c8703b202e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export type NotificationType =
  | "contract_offer"
  | "contract_accepted"
  | "contract_declined"
  | "contract_stage_updated"
  | "contract_completed"
  | "xp_earned";

export interface Notification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  address: string;
  senderHandle?: string;
  contractId?: string;
  xpAmount?: number;
  read: boolean;
  createdAt: Timestamp;
}

export const createNotification = async (
  notification: Omit<Notification, "id" | "createdAt" | "read">
) => {
  try {
    // Remove any undefined fields from the notification object
    const cleanNotification = Object.fromEntries(
      Object.entries({
        ...notification,
        read: false,
        createdAt: Timestamp.now(),
      }).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, "notifications"), cleanNotification);
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getNotifications = (
  address: string,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(collection(db, "notifications"), where("address", "==", address));

  return onSnapshot(q, snapshot => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
    callback(notifications);
  });
};
