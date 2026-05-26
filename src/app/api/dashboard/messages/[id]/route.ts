import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retry, isAbortLike } from "@/lib/retry";

export async function PATCH(req: Request, context: any) {
  // `context.params` may be a Promise in some Next versions; normalize it.
  const rawParams = context?.params;
  const params =
    rawParams && typeof rawParams.then === "function"
      ? await rawParams
      : rawParams;
  const { id } = params || {};
  try {
    const body = await req.json();
    const supabase = await createClient();

    await retry(
      async () => {
        const { error } = await supabase
          .from("messages")
          .update(body)
          .eq("id", id);
        if (error) throw error;
        return true;
      },
      3,
      isAbortLike,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/api/dashboard/messages/[id] PATCH error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
