"use client";

import { useId, useRef, useState } from "react";

import Magnetic from "@/components/ui/Magnetic";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { contact, identity } from "@/content/site";
import { contactSchema, type ContactResponse } from "@/lib/contact-schema";

type State = "idle" | "submitting" | "success" | "error";

const FIELD_CLASS =
  "w-full border-b border-line bg-transparent pb-3 pt-2 text-bone placeholder:text-dim focus:border-signal focus:outline-none focus-visible:outline-none transition-colors";

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<State>("idle");
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ids = useId();

  const fieldId = (name: string) => `${ids}-${name}`;
  const errorId = (name: string) => `${ids}-${name}-error`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    const data = Object.fromEntries(new FormData(event.currentTarget));

    // Validate client-side first so obvious mistakes never cost a round trip.
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "form");
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      setState("error");
      setFeedback("Some fields need another look.");
      // Move focus to the first thing that's wrong.
      const first = Object.keys(fieldErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setState("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as ContactResponse;

      if (result.ok) {
        setState("success");
        setFeedback(result.message);
        formRef.current?.reset();
        return;
      }

      setState("error");
      setFeedback(result.message);
      if (result.fieldErrors) setErrors(result.fieldErrors);
    } catch {
      setState("error");
      setFeedback(
        `Couldn't reach the server. Email me directly at ${identity.email}.`
      );
    }
  }

  return (
    <section
      id="contact"
      className="group/section relative border-t border-line py-20 sm:py-28 lg:py-36"
    >
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative shell">
        <SectionHead
          index="7"
          label={contact.label}
          heading={contact.heading}
          aside={identity.availability.open ? "open to offers" : "not looking"}
          className="max-w-4xl"
        />

        <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="text-[length:var(--text-lede)] leading-[1.45] text-bone">
              {contact.body}
            </p>

            <div className="mt-10 space-y-5">
              <div>
                <p className="label">Direct</p>
                <a
                  href={`mailto:${identity.email}`}
                  className="mt-1 inline-flex min-h-11 items-center text-sm text-signal underline decoration-signal/30 underline-offset-4 transition-colors hover:decoration-signal"
                >
                  {identity.email}
                </a>
              </div>
              <div>
                <p className="label">Status</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-bone">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
                  {identity.availability.detail}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={0.1}>
            <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor={fieldId("name")} className="label block">
                    Name
                  </label>
                  <input
                    id={fieldId("name")}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    className={`${FIELD_CLASS} mt-3 ${errors.name ? "border-[#7a3b3b]" : ""}`}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? errorId("name") : undefined}
                  />
                  {errors.name ? (
                    <p id={errorId("name")} className="mt-2 text-xs text-[#d98b8b]">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor={fieldId("email")} className="label block">
                    Email
                  </label>
                  <input
                    id={fieldId("email")}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="ada@company.com"
                    className={`${FIELD_CLASS} mt-3 ${errors.email ? "border-[#7a3b3b]" : ""}`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? errorId("email") : undefined}
                  />
                  {errors.email ? (
                    <p id={errorId("email")} className="mt-2 text-xs text-[#d98b8b]">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor={fieldId("message")} className="label block">
                  Message
                </label>
                <textarea
                  id={fieldId("message")}
                  name="message"
                  rows={5}
                  placeholder="What are you building, and where would I fit?"
                  className={`${FIELD_CLASS} mt-3 resize-y ${errors.message ? "border-[#7a3b3b]" : ""}`}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? errorId("message") : undefined}
                />
                {errors.message ? (
                  <p id={errorId("message")} className="mt-2 text-xs text-[#d98b8b]">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              {/* Honeypot: off-screen rather than display:none, which some bots
                  are wise to. Never announced, never tab-reachable. */}
              <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                <label htmlFor={fieldId("company")}>Company (leave blank)</label>
                <input
                  id={fieldId("company")}
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Magnetic strength={0.24}>
                  <button
                    type="submit"
                    disabled={state === "submitting"}
                    className="group inline-flex h-13 items-center gap-3 rounded-full bg-bone px-7 text-[0.9rem] font-medium tracking-[-0.01em] text-void transition-colors hover:bg-signal disabled:cursor-wait disabled:opacity-60"
                  >
                    {state === "submitting" ? "Sending" : "Send message"}
                    <span
                      aria-hidden="true"
                      className={
                        state === "submitting"
                          ? "animate-pulse"
                          : "transition-transform duration-300 group-hover:translate-x-1"
                      }
                    >
                      {state === "submitting" ? "···" : "→"}
                    </span>
                  </button>
                </Magnetic>

                <p
                  role="status"
                  aria-live="polite"
                  className={`text-[0.85rem] leading-relaxed ${
                    state === "success"
                      ? "text-signal"
                      : state === "error"
                        ? "text-[#d98b8b]"
                        : "text-dim"
                  }`}
                >
                  {feedback}
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
