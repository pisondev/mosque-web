import { NextResponse } from "next/server";

const SESSION_MAX_AGE = 60 * 60 * 24 * 3;

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set("mosque_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete("mosque_session");
  return response;
}
