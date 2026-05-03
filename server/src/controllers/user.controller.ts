import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";

export async function listUsers(request: Request, response: Response) {
  const users = await userService.listUsers(request.user!, request.query);
  response.json({ users });
}
