import { z } from "zod";

export const userListQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  projectId: z.string().optional()
});
