import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export async function signup(request: Request, response: Response) {
  const result = await authService.signup(request.body);
  response.status(201).json(result);
}

export async function login(request: Request, response: Response) {
  const result = await authService.login(request.body);
  response.json(result);
}

export async function logout(_request: Request, response: Response) {
  response.json({ message: "Logged out successfully" });
}

export async function me(request: Request, response: Response) {
  const user = await authService.getCurrentUser(request.user!.id);
  response.json({ user });
}
