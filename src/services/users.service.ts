import { apiFetch } from "@/lib/api";
import { User } from "@/lib/types";

export interface UserCreate {
  email: string;
  full_name: string;
  password?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export async function getUsers(): Promise<User[]> {
  return apiFetch<User[]>("/users/");
}

export async function getUserById(id: string | number): Promise<User> {
  return apiFetch<User>(`/users/${id}`);
}

export async function createUser(data: UserCreate): Promise<User> {
  return apiFetch<User>("/users/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string | number, data: Partial<UserCreate>): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string | number): Promise<void> {
  return apiFetch<void>(`/users/${id}`, {
    method: "DELETE",
  });
}
