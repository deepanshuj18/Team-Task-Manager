import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const clientUrlSchema = z
  .string()
  .min(1, "CLIENT_URL is required")
  .refine(
    (value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .every((item) => z.string().url().safeParse(item).success),
    "CLIENT_URL must contain valid URL values"
  );

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: clientUrlSchema.default("http://localhost:5173"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(8).max(14).default(10)
});

export const env = envSchema.parse(process.env);
