import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const url = `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=password`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json({ error: data?.error_description || data?.error || 'Invalid credentials' }, { status: res.status });
    }

    // Build response and set HttpOnly cookies so server-side requests can read session
    const response = NextResponse.json(data);

    try {
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;
      const expiresAt = data.expires_at ? new Date(data.expires_at * 1000) : undefined;

      if (accessToken) {
        response.cookies.set("sb-access-token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: expiresAt,
        });
      }

      if (refreshToken) {
        response.cookies.set("sb-refresh-token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          // refresh tokens typically long-lived; set a far future expiry
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        });
      }
    } catch (e) {
      // Non-fatal: continue without cookies
      console.error("Failed to set auth cookies:", e);
    }

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
