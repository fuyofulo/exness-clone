import { z } from "zod";

// user schema
export const signupSchema = z.object({
    name: z.string().min(1),
    password: z.string().min(1),
    email: z.email(),
});

export const signinSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});