"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Clock, Mail, MessageCircle, Send, AtSign, Share2 } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Dropdown } from "@/components/shared/dropdown";
import { Button } from "@/components/ui/button";
import { fadeInUp, revealOnScroll } from "@/lib/motion";

const topics = [
  { value: "order", label: "An order I placed" },
  { value: "product", label: "Product / sizing question" },
  { value: "partnership", label: "Partnership or press" },
  { value: "other", label: "Something else" },
];

export default function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("order");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Contact us" }]} />

      <motion.div variants={fadeInUp} initial="hidden" animate="show" className="mt-6 max-w-2xl">
        <h1 className="text-balance font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Get in touch.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-dim">
          Questions about an order, sizing, a drop, or a partnership — send it over and a real
          person on the team will get back to you.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <motion.div variants={fadeInUp} {...revealOnScroll} className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-cyan/10 text-accent-cyan">
                <Check className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">Message sent</h2>
              <p className="max-w-xs text-sm text-ink-dim">
                Thanks, {name.split(" ")[0]} — we usually reply within one business day.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setMessage("");
                  setTopic("order");
                }}
              >
                Send another message
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-medium text-ink-dim">Name</span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
                  />
                </label>
                <label>
                  <span className="text-xs font-medium text-ink-dim">Email</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
                  />
                </label>
              </div>

              <label>
                <span className="text-xs font-medium text-ink-dim">What&apos;s this about?</span>
                <Dropdown
                  className="mt-1.5"
                  fullWidth
                  ariaLabel="What's this about?"
                  value={topic}
                  options={topics}
                  onChange={setTopic}
                />
              </label>

              <label>
                <span className="text-xs font-medium text-ink-dim">Message</span>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's going on..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-line bg-void px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
                />
              </label>

              <Button type="submit" size="lg" variant="accent" className="justify-self-start">
                Send message <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </motion.div>

        {/* Side info */}
        <motion.div variants={fadeInUp} {...revealOnScroll} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-ink">Email us directly</h3>
            <a href="mailto:hello@fandomwear.example" className="mt-1 block text-sm text-ink-dim hover:text-accent-cyan">
              hello@fandomwear.example
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan/15 text-accent-cyan">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-ink">Response time</h3>
            <p className="mt-1 text-sm text-ink-dim">Usually within 1 business day, Mon–Fri.</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-red/15 text-accent-red">
              <MessageCircle className="h-4.5 w-4.5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-ink">Order help</h3>
            <p className="mt-1 text-sm text-ink-dim">
              Have an order number ready — check{" "}
              <Link href="/account/orders" className="text-ink underline underline-offset-4 hover:text-accent-cyan">
                your orders
              </Link>{" "}
              first for the fastest answer.
            </p>
          </div>

          <div className="flex gap-3 rounded-2xl border border-line bg-surface p-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FandomWear on Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
            >
              <AtSign className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FandomWear on Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
            >
              <Share2 className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
