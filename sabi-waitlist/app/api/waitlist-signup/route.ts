import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/hooks/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, phoneNumber, source } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("waitlist").insert([
      {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        source: source || "form_submission",
      },
    ]);

    console.log("Supabase waitlist insert response:", { data, error });

    if (error) {
      console.error("Error inserting into waitlist:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Successfully added to waitlist", data });
  } catch (error) {
    console.error("Unexpected error adding to waitlist:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
