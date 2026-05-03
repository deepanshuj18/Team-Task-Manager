import { http } from "./http";
import type { AuthResponse, User } from "../types";

export async function signup(payload: { name: string; email: string; password: string }) {
  const { data } = await http.post<AuthResponse>("/auth/signup", payload);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await http.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function logout() {
  await http.post("/auth/logout");
}

export async function getCurrentUser() {
  const { data } = await http.get<{ user: User }>("/auth/me");
  return data.user;
}
