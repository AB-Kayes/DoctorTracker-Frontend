import { api } from "@/lib/api";
import { IUser } from "@/types";

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  async logout() {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  async getMe(): Promise<{ user: IUser }> {
    const res = await api.get("/auth/me");
    return res.data;
  },
};
