import { http } from "./http";
import type { Role, User } from "../types";

export async function fetchUsers(params?: { role?: Role; projectId?: string; search?: string }) {
  const { data } = await http.get<{ users: User[] }>("/users", { params });
  return data.users;
}
