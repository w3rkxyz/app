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

export const W3RK_NOTIFICATION_COLLECTION = "notifications";

export type W3rkNotificationType =
  | "contract_proposal"
  | "contract_started"
  | "payment_requested"
  | "contract_completed"
  | "contract_cancelled"
  | "escrow_funded"
  | "escrow_released";

export const W3RK_NOTIFICATION_ICONS: Record<W3rkNotificationType, string> = {
  contract_proposal: "/images/FilePlus.svg",
  contract_started: "/images/Handshake.svg",
  payment_requested: "/images/HandCoins.svg",
  contract_completed: "/images/CheckCircle.svg",
  contract_cancelled: "/images/XCircle.svg",
  escrow_funded: "/images/Receipt.svg",
  escrow_released: "/images/Receipt.svg",
};

export interface W3rkNotification {
  id?: string;
  source: "w3rk";
  type: W3rkNotificationType;
  title: string;
  message: string;
  recipientLensAddress: string;
  senderHandle?: string;
  senderLensAddress?: string;
  contractId?: string;
  proposalId?: number;
  txLink?: string;
  icon?: string;
  read: boolean;
  createdAt: Timestamp;
}

export const createW3rkNotification = async (
  notification: Omit<W3rkNotification, "id" | "source" | "createdAt" | "read" | "icon"> & {
    icon?: string;
  }
) => {
  try {
    // Remove any undefined fields from the notification object
    const cleanNotification = Object.fromEntries(
      Object.entries({
        source: "w3rk" as const,
        ...notification,
        icon: notification.icon || W3RK_NOTIFICATION_ICONS[notification.type],
        read: false,
        createdAt: Timestamp.now(),
      }).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, W3RK_NOTIFICATION_COLLECTION), cleanNotification);
    return docRef.id;
  } catch (error) {
    console.error("Error creating w3rk notification:", error);
    throw error;
  }
};

export const getW3rkNotifications = (
  recipientLensAddress: string,
  callback: (notifications: W3rkNotification[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, W3RK_NOTIFICATION_COLLECTION),
    where("recipientLensAddress", "==", recipientLensAddress)
  );

  return onSnapshot(
    q,
    snapshot => {
      const notifications = snapshot.docs
        .map(doc => {
          const data = doc.data() as Partial<W3rkNotification>;
          return {
            id: doc.id,
            source: "w3rk" as const,
            ...data,
          };
        })
        .filter(notification => notification.source === "w3rk") as W3rkNotification[];
      callback(notifications);
    },
    error => {
      if (onError) {
        onError(error as Error);
      } else {
        console.error("Error loading w3rk notifications:", error);
      }
    }
  );
};

// Backward-compatible aliases for existing imports in the codebase.
export type NotificationType = W3rkNotificationType;
export interface Notification extends W3rkNotification {}
export const createNotification = createW3rkNotification;
export const getNotifications = getW3rkNotifications;
