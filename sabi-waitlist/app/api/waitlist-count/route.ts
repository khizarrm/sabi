import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Temporarily use service role key for debugging RLS
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  try {
    console.log("yeeehrhehrkj")
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    console.log("Supabase waitlist count response (using service_role key):", { count, error });

    if (error) {
      console.error("Error fetching waitlist count:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unexpected error fetching waitlist count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
