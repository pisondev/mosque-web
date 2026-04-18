import { proxyAuthRequest } from "@/lib/auth-proxy";

export async function POST(request: Request) {
  return proxyAuthRequest(request, "/api/v1/auth/google", { setSession: true });
}
