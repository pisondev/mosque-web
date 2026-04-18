import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { proxyWithSession } from "@/lib/session-proxy";

const SUBDOMAIN_REGEX = /^[a-z-]{1,10}$/;

export async function POST(request: Request) {
  let payload: { name?: string; subdomain?: string };
  try {
    payload = (await request.json()) as { name?: string; subdomain?: string };
  } catch {
    return NextResponse.json({ status: "error", message: "Format payload tidak valid." }, { status: 400 });
  }

  const name = String(payload.name || "").trim();
  const subdomain = String(payload.subdomain || "").trim().toLowerCase();

  if (!name) {
    return NextResponse.json({ status: "error", message: "Nama resmi wajib diisi." }, { status: 400 });
  }

  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    return NextResponse.json(
      { status: "error", message: "Subdomain hanya boleh huruf kecil (a-z) dan strip (-), maksimal 10 karakter." },
      { status: 400 },
    );
  }

  try {
    const result = await proxyWithSession("/api/v1/tenant/setup", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, subdomain }),
      cache: "no-store",
    }, request);

    if (result.errorResponse) {
      return result.errorResponse;
    }

    const { upstream, body } = result;
    if (!upstream.ok) {
      const firstFieldError = Array.isArray(body?.errors) ? body.errors[0]?.message : null;
      return NextResponse.json(
        { status: "error", message: firstFieldError || body?.message || "Gagal menyimpan data." },
        { status: upstream.status },
      );
    }

    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ status: "success", success: true });
  } catch {
    return NextResponse.json({ status: "error", message: "Terjadi kesalahan jaringan." }, { status: 502 });
  }
}
