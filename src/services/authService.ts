import { api } from "@/lib/api";
import { IUser } from "@/types";

export function setClientToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    const isSecure = window.location.protocol === "https:";
    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  }
}

export function clearClientToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  }
}

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await api.post("/auth/register", data);
    if (res.data?.token) {
      setClientToken(res.data.token);
    }
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post("/auth/login", data);
    if (res.data?.token) {
      setClientToken(res.data.token);
    }
    return res.data;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearClientToken();
    }
  },

  async getMe(): Promise<{ user: IUser }> {
    const res = await api.get("/auth/me");
    return res.data;
  },
};
