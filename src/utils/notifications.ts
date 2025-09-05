import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import app from "@/firebase";

// Initialize Firebase
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
