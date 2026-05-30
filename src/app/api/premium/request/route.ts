import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, premiumContactEmail } from "@/lib/supabase/config";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";

  let email = typeof body.email === "string" ? body.email.trim() : "";

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) email = user.email;
    }
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Sign in or provide a valid email." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (admin) {
    await admin.from("premium_requests").insert({ email, note: note || null });
  }

  const contact = premiumContactEmail();
  const subject = encodeURIComponent("ThreadLens Premium request");
  const bodyText = encodeURIComponent(
    `Hi,\n\nI'd like ThreadLens Premium enabled for: ${email}\n\n${note ? `Note: ${note}\n` : ""}\nThanks!`
  );

  return NextResponse.json({
    ok: true,
    mailto: `mailto:${contact}?subject=${subject}&body=${bodyText}`,
    message: `Request recorded. Email ${contact} to enable premium on your account.`,
  });
}
