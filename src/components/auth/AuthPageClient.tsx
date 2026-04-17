"use client";

import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";

type AuthMode = "login" | "register" | "forgot" | "reset";

type ApiResponse = {
  status?: string;
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
};

export default function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = normalizeMode(searchParams.get("mode"));
  const resetToken = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardCopy = useMemo(() => getCardCopy(mode), [mode]);

  const switchMode = (nextMode: AuthMode) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("mode", nextMode);
    if (nextMode !== "reset") {
      next.delete("token");
    }
    router.replace(`/auth?${next.toString()}`);
    setMessage("");
    setErrorMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if ((mode === "register" || mode === "reset") && password !== confirmPassword) {
      setErrorMessage("Konfirmasi password belum sama.");
      return;
    }

    const endpoint = getEndpoint(mode);
    if (!endpoint) {
      setErrorMessage("Mode autentikasi tidak valid.");
      return;
    }

    const payload =
      mode === "forgot"
        ? { email }
        : mode === "reset"
          ? { token: resetToken, password }
          : { email, password };

    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as ApiResponse | null;

      if (!response.ok) {
        setErrorMessage(body?.errors?.[0]?.message || body?.message || "Autentikasi gagal diproses.");
        return;
      }

      if (mode === "forgot") {
        setMessage(body?.message || "Email reset password berhasil dikirim.");
        return;
      }

      if (mode === "reset") {
        window.location.assign("/dashboard");
        return;
      }

      window.location.assign("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setErrorMessage("Token Google tidak tersedia.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const body = (await response.json().catch(() => null)) as ApiResponse | null;
      if (!response.ok) {
        setErrorMessage(body?.message || "Google sign-in gagal.");
        return;
      }

      window.location.assign("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,#f8fafc_0%,#ecfdf5_45%,#ffffff_100%)] px-6 py-8 text-slate-900 md:px-10 lg:px-14">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center gap-8 lg:flex-row lg:items-stretch">
        <section className="flex-1 rounded-[32px] border border-emerald-100 bg-slate-950 px-7 py-8 text-white shadow-2xl shadow-emerald-950/10 md:px-10 md:py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke landing page
          </Link>

          <div className="mt-10 space-y-5">
            <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">
              Auth Center
            </span>
            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-5xl">
              Satu pintu masuk untuk admin masjid, onboarding tenant, dan pemulihan akun.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Login email/password, daftar tenant baru, gunakan Google Sign-In, atau reset password dari satu halaman autentikasi yang terhubung langsung ke backend `mosque-api`.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <InfoTile icon={ShieldCheck} title="JWT aman" description="Cookie sesi httpOnly diset dari route handler Next." />
            <InfoTile icon={Mail} title="Reset via email" description="Lupa password dikirim ke email melalui Resend." />
            <InfoTile icon={KeyRound} title="Satu akun admin" description="Tenant baru otomatis dibuat saat register pertama." />
          </div>
        </section>

        <section className="w-full max-w-xl rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-2xl shadow-slate-900/8 backdrop-blur md:p-8">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold text-slate-500">
            <button type="button" onClick={() => switchMode("login")} className={tabClassName(mode === "login")}>
              <LogIn className="h-4 w-4" /> Login
            </button>
            <button type="button" onClick={() => switchMode("register")} className={tabClassName(mode === "register")}>
              <UserPlus className="h-4 w-4" /> Register
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-950">{cardCopy.title}</h2>
            <p className="text-sm leading-6 text-slate-500">{cardCopy.description}</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {mode !== "reset" && (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder="admin@masjid.id"
                  required
                />
              </label>
            )}

            {mode !== "forgot" && (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder={mode === "login" ? "Masukkan password" : "Minimal 8 karakter, kombinasi huruf dan angka"}
                  required
                />
              </label>
            )}

            {(mode === "register" || mode === "reset") && (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Konfirmasi password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder="Ulangi password"
                  required
                />
              </label>
            )}

            {mode === "login" && (
              <button type="button" onClick={() => switchMode("forgot")} className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900">
                Lupa password?
              </button>
            )}

            {mode === "forgot" && (
              <button type="button" onClick={() => switchMode("login")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
                Kembali ke login
              </button>
            )}

            {message && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (mode === "reset" && !resetToken)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : cardCopy.buttonIcon}
              {cardCopy.buttonLabel}
            </button>
          </form>

          {(mode === "login" || mode === "register") && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                Atau lanjut dengan Google
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setErrorMessage("Google sign-in gagal diproses.")} theme="outline" shape="pill" />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoTile({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
      <div className="inline-flex rounded-2xl bg-emerald-400/12 p-3 text-emerald-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function tabClassName(isActive: boolean) {
  return `flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 transition ${
    isActive ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
  }`;
}

function getEndpoint(mode: AuthMode) {
  switch (mode) {
    case "login":
      return "/api/v1/auth/login";
    case "register":
      return "/api/v1/auth/register";
    case "forgot":
      return "/api/v1/auth/forgot-password";
    case "reset":
      return "/api/v1/auth/reset-password";
    default:
      return "";
  }
}

function normalizeMode(mode: string | null): AuthMode {
  if (mode === "register" || mode === "forgot" || mode === "reset") {
    return mode;
  }
  return "login";
}

function getCardCopy(mode: AuthMode) {
  if (mode === "register") {
    return {
      title: "Buat akun admin baru",
      description: "Tenant awal akan dibuat otomatis. Setelah masuk, Anda bisa lanjut onboarding nama masjid, subdomain, dan pengaturan website.",
      buttonLabel: "Daftar dan masuk",
      buttonIcon: <UserPlus className="h-4 w-4" />,
    };
  }

  if (mode === "forgot") {
    return {
      title: "Kirim tautan reset password",
      description: "Masukkan email admin. Jika akun ditemukan, sistem akan mengirim tautan reset ke inbox Anda.",
      buttonLabel: "Kirim email reset",
      buttonIcon: <Mail className="h-4 w-4" />,
    };
  }

  if (mode === "reset") {
    return {
      title: "Atur password baru",
      description: "Password baru akan langsung mengaktifkan sesi login Anda di perangkat ini.",
      buttonLabel: "Simpan password baru",
      buttonIcon: <KeyRound className="h-4 w-4" />,
    };
  }

  return {
    title: "Masuk ke dashboard",
    description: "Gunakan email/password atau Google Sign-In untuk mengakses panel admin eTAKMIR.",
    buttonLabel: "Masuk sekarang",
    buttonIcon: <LogIn className="h-4 w-4" />,
  };
}
