import { cookies } from "next/headers";

export type SessionPayload = {
  userId: string;
  email: string;
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("bkg.session")?.value;
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    return decoded as SessionPayload;
  } catch {
    return null;
  }
}
