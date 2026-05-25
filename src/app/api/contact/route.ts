import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retry, isAbortLike } from "@/lib/retry";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    await retry(
      async () => {
        const { error } = await supabase.from("messages").insert([body]);
        if (error) throw error;
        return true;
      },
      3,
      isAbortLike,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Log server-side for debugging
    // eslint-disable-next-line no-console
    console.error("/api/contact error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
