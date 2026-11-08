import * as z from "zod";

export const DIVISIONS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna",
  "Barishal", "Sylhet", "Rangpur", "Mymensingh",
] as const;

export const CHANNELS = ["website", "daraz", "facebook"] as const;

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid BD phone number (e.g. 01712345678)"),
  address: z.string().trim().min(5, "Please enter a full address"),
  division: z.enum(DIVISIONS),
  source: z.enum(CHANNELS),
});

export type CustomerInput = z.infer<typeof customerSchema>;