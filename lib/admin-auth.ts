import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "rfj_admin";

// The session cookie holds an HMAC derived from ADMIN_PASSWORD, so changing the
// password in Vercel signs everyone out.
function sessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("rememberfatherjoe-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function passwordMatches(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && safeEqual(input, password!);
}

export async function isAdmin() {
  const token = sessionToken();
  const value = (await cookies()).get(COOKIE)?.value;
  return Boolean(token && value && safeEqual(value, token));
}

export async function startSession() {
  (await cookies()).set(COOKIE, sessionToken()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not signed in");
}
