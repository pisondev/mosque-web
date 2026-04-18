import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const nextRouterPrefetch = request.headers.get("next-router-prefetch");
  const nextRouterSegmentPrefetch = request.headers.get("next-router-segment-prefetch");
  const purpose = request.headers.get("purpose");
  const secPurpose = request.headers.get("sec-purpose");

  const isPrefetch =
    nextRouterPrefetch !== null ||
    nextRouterSegmentPrefetch !== null ||
    purpose === "prefetch" ||
    secPurpose === "prefetch";

  if (isPrefetch) {
    return new NextResponse(null, { status: 204 });
  }

  const cookieStore = await cookies();
  
  // Logout nyata: hapus cookie sesi lalu kembalikan ke landing page.
  cookieStore.delete("mosque_session");

  return NextResponse.redirect(new URL("/", request.url));
}
