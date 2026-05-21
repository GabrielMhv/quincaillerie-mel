import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  try {
    res.cookies.set("sb-access-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
    res.cookies.set("sb-refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
  } catch (e) {
    console.error("Failed to clear auth cookies:", e);
  }

  return res;
}
