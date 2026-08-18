import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Public contact intake is disabled. Use the verified professional profile links on the site.",
    },
    { status: 410 },
  );
}
