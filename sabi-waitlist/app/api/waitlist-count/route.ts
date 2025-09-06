import { NextResponse } from "next/server";
import { supabase } from "@/hooks/supabase";

export async function GET() {
  try {
    console.log("yeeehrhehrkj")
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact" });

    console.log("Supabase waitlist count response:", { count, error });

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
