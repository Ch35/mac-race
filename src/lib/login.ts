'use server'

import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { isEmpty } from "lodash";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const key = new TextEncoder().encode(process.env.ENCODE_SECRET);
const TOMORROW = new Date().getTime() + 24 * 60 * 60 * 1000;
const httpOnly = process.env.NODE_ENV !== "development";

const getCookie = (value: string) => ({
  name: "session",
  value: value,
  httpOnly,
  expires: new Date(TOMORROW),
});

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day")
    .sign(key);
}

export async function decrypt(input: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return {};
  }
}

export async function login(formData: FormData) {
  const user = { authId: formData.get("authId"), authCred: formData.get("authCred") };

  if (user.authId === process.env.AUTH_ID && user.authCred === process.env.AUTH_SECRET) {
    const expires = new Date(TOMORROW);
    const session = await encrypt({ user, expires });
    const cookieStore = await cookies();
    const cookieSet = getCookie(session);

    cookieStore.set(cookieSet.name, cookieSet.value, { expires: cookieSet.expires, httpOnly: cookieSet.httpOnly });
    return true;
  }

  return false;
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return false;
  const decrypted = await decrypt(session);

  return isEmpty(decrypted) ? false : decrypted;
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;
  const parsed = await decrypt(session);
  if (!parsed || isEmpty(parsed)) return;

  parsed.expires = new Date(TOMORROW);
  const res = NextResponse.next();
  res.cookies.set(getCookie(await encrypt(parsed)));
  return res;
}