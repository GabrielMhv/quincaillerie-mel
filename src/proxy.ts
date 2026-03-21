import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";


export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy logic for static files and images to save time
  if (
    pathname.includes(".") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
