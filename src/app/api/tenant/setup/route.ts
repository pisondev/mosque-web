import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerApiOrigin } from "@/lib/server-api";

const API_INTERNAL = getServerApiOrigin();
const SUBDOMAIN_REGEX = /^[a-z-]{1,10}$/;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (!token) {
    return NextResponse.json({ status: "error", message: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
  }

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
    const upstream = await fetch(`${API_INTERNAL}/api/v1/tenant/setup`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, subdomain }),
      cache: "no-store",
    });

    const body = await upstream.json().catch(() => null);
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
