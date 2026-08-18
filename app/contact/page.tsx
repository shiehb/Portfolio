// app/contact/page.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const socials = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "Twitter", href: "https://twitter.com" },
];

const EMAIL = "hello@jerichourbano.dev";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setIsSubmitted(true);
    
    // Reset form after submission
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 pb-16 font-display bg-[#222222]">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="text-center"
        >
          <span className="block mb-2 md:mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0]">
            GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] text-white">
            Let&apos;s work<br />
            <span className="text-[#fd551d]">together</span>
          </h1>
          <p className="mx-auto mt-4 md:mt-6 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-[#c0c0c0]">
            Have a project in mind? Whether it&apos;s a website, a film, or a full brand
            identity — drop a message and I&apos;ll get back to you within 24 hours.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
          className="mt-10 md:mt-14 flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#c0c0c0]">Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-transparent border-b-2 border-zinc-700 focus:border-[#fd551d] outline-none py-2 text-sm sm:text-base text-white placeholder:text-zinc-600 transition-colors"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#c0c0c0]">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent border-b-2 border-zinc-700 focus:border-[#fd551d] outline-none py-2 text-sm sm:text-base text-white placeholder:text-zinc-600 transition-colors"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#c0c0c0]">Message</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me about your project..."
              className="bg-transparent border-b-2 border-zinc-700 focus:border-[#fd551d] outline-none py-2 text-sm sm:text-base text-white placeholder:text-zinc-600 transition-colors resize-none"
            />
          </label>

          <button
            type="submit"
            className="nav-menu-link self-center sm:self-start mt-2 cursor-pointer bg-transparent border-none text-white"
          >
            Send Message
          </button>

          {/* Success Message */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-green-400 text-sm"
            >
              ✓ Message sent successfully! I'll get back to you soon.
            </motion.div>
          )}
        </motion.form>

        {/* Direct info + socials */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-zinc-800 pt-8"
        >
          <a
            href={`mailto:${EMAIL}`}
            className="text-sm sm:text-base text-white hover:text-[#fd551d] transition-colors"
          >
            {EMAIL}
          </a>

          <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 list-none m-0 p-0">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0] hover:text-white transition-colors"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}