import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminFirestore } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const W3RK_NOTIFICATION_COLLECTION = "notifications";

type RouteNotification = {
  id: string;
  message: string;
  title: string;
  type: string;
  read: boolean;
  icon?: string;
  senderHandle?: string;
  senderLensAddress?: string;
  recipientLensAddress?: string;
  contractId?: string;
  proposalId?: number;
  txLink?: string;
  createdAt: string;
};

const toIsoDate = (value: unknown): string => {
  if (!value) return new Date(0).toISOString();
  if (typeof (value as any).toDate === "function") {
    return (value as any).toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0).toISOString();
  }
  return parsed.toISOString();
};

export async function GET(request: NextRequest) {
  const recipientLensAddress = request.nextUrl.searchParams
    .get("recipientLensAddress")
    ?.trim()
    .toLowerCase();

  if (!recipientLensAddress) {
    return NextResponse.json(
      { error: "recipientLensAddress query param is required." },
      { status: 400 }
    );
  }

  try {
    const db = getFirebaseAdminFirestore();
    const snapshot = await db
      .collection(W3RK_NOTIFICATION_COLLECTION)
      .where("recipientLensAddress", "==", recipientLensAddress)
      .get();

    const notifications = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message || "",
          title: data.title || "",
          type: data.type || "",
          read: Boolean(data.read),
          icon: data.icon,
          senderHandle: data.senderHandle,
          senderLensAddress: data.senderLensAddress,
          recipientLensAddress: data.recipientLensAddress,
          contractId: data.contractId,
          proposalId: data.proposalId,
          txLink: data.txLink,
          createdAt: toIsoDate(data.createdAt),
        } as RouteNotification;
      })
      .filter(item => item.type)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return NextResponse.json({ items: notifications });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load notifications.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
