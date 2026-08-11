import { z } from "zod";

/**
 * Shared by the form and the route handler, so the rules can't drift apart.
 * The client validation is a courtesy; the server one is the actual gate.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell me what to call you.")
    .max(80, "That's longer than any name I can render."),
  email: z.email("That doesn't look like an email address."),
  message: z
    .string()
    .trim()
    .min(20, "A little more detail — 20 characters at least.")
    .max(2000, "Over 2000 characters. Send me the short version."),
  /**
   * Honeypot. Hidden from humans, irresistible to naive bots.
   *
   * Deliberately permissive: if the schema rejected a filled-in value, the
   * 422 would name this field and hand a bot the map to the minefield. It
   * validates fine, and the route handler quietly discards it instead.
   */
  company: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactResponse =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
