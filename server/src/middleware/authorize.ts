import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { ApiError } from "../utils/api-error.js";

export function authorize(...roles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(request.user.role)) {
      return next(new ApiError(403, "You are not allowed to perform this action"));
    }

    return next();
  };
}