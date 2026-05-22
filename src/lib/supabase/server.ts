import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  // Read cookies per-request using `cookies()` so we don't capture
  // a stale cookie store across requests (avoid caching here).
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Some Next versions provide `getAll`; others only `get`.
          // Prefer `getAll` when available, otherwise synthesize from known keys.
          // `createServerClient` expects an array of { name, value, options }.
          // Try to call `cookieStore.getAll()` if present.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (typeof cookieStore.getAll === "function") {
            // normalize shape if necessary
            // Some runtimes return RequestCookies with getAll() returning objects
            return cookieStore.getAll();
          }

          const known = ["sb-access-token", "sb-refresh-token"]; 
          const out: { name: string; value: string; options?: any }[] = [];
          for (const name of known) {
            // cookieStore.get may return { name, value }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const c = cookieStore.get ? cookieStore.get(name) : null;
            if (c) {
              out.push({ name, value: (c as any).value || String(c) });
            }
          }
          return out;
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    },
  );
};
