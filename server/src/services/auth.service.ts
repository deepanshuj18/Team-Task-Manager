import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { publicUserSelect } from "../utils/serializers.js";
import { signToken } from "../utils/token.js";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

function buildAuthPayload(user: { id: string; email: string; name: string; role: Role }) {
  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  return {
    token,
    user
  };
}

export async function signup(input: SignupInput) {
  const email = input.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: "MEMBER"
    },
    select: publicUserSelect
  });

  return buildAuthPayload(user);
}

export async function login(input: LoginInput) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return buildAuthPayload({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}
