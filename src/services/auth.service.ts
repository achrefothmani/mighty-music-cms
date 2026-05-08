import { apiFetch } from "@/lib/api";

export async function login(username: string, password: string): Promise<{ access_token: string, token_type: string }> {
  // OAuth2PasswordRequestForm expects x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  // We don't use apiFetch here because apiFetch sets Content-Type to application/json by default
  // and we need x-www-form-urlencoded for the FastAPI OAuth2 endpoint.
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  return res.json();
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}
