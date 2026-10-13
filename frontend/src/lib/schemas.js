import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  body: z.string().trim().min(10, "Tell me a little more (10+ characters)").max(4000),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Required").max(160),
  summary: z.string().trim().min(1, "Required").max(300),
  description: z.string().max(5000).optional().default(""),
  category: z.enum(["developer", "ai", "designer", "professional"]),
  tags: z.string().optional().default(""), // comma separated; split on submit
  image_url: z.string().url("Must be a full URL").or(z.literal("")).default(""),
  live_url: z.string().url("Must be a full URL").or(z.literal("")).default(""),
  repo_url: z.string().url("Must be a full URL").or(z.literal("")).default(""),
  featured: z.boolean().default(false),
});
