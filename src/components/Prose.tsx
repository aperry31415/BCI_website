import type { ReactNode } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { motion } from "framer-motion";

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={id}
      className="mx-auto max-w-[760px] px-6 py-20 md:py-28 scroll-mt-20"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {eyebrow && (
        <div
          className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--accent)" }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className="font-serif-display mb-6 text-[32px] md:text-[38px] font-medium leading-[1.15]"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h2>
      <div className="space-y-5 text-[17px] leading-[1.7]" style={{ color: "var(--text-muted)" }}>
        {children}
      </div>
    </motion.section>
  );
}

export function M({ tex }: { tex: string }) {
  return <InlineMath math={tex} />;
}

export function Eq({ tex, label }: { tex: string; label?: string }) {
  return (
    <div className="relative my-6">
      <div
        className="overflow-x-auto rounded-xl px-5 py-4"
        style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}
      >
        <BlockMath math={tex} />
      </div>
      {label && (
        <div
          className="mt-2 text-right text-[12px] tracking-wide"
          style={{ color: "var(--text-faint)" }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export function Callout({ kind = "note", children }: { kind?: "note" | "insight"; children: ReactNode }) {
  const isInsight = kind === "insight";
  return (
    <div
      className="rounded-xl px-5 py-4 text-[16px] leading-[1.65]"
      style={{
        background: isInsight ? "var(--accent-soft)" : "var(--bg-sunken)",
        border: `1px solid ${isInsight ? "transparent" : "var(--border)"}`,
        color: isInsight ? "var(--text)" : "var(--text-muted)",
      }}
    >
      <span
        className="mr-2 text-[12px] font-semibold uppercase tracking-wide"
        style={{ color: isInsight ? "var(--accent)" : "var(--text-faint)" }}
      >
        {isInsight ? "Key idea" : "Note"}
      </span>
      {children}
    </div>
  );
}

export function Figure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="my-8 -mx-6 md:mx-0">
      <div
        className="rounded-2xl p-4 md:p-6"
        style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
      >
        {children}
      </div>
      <figcaption
        className="mt-3 px-2 text-[14px] leading-[1.55]"
        style={{ color: "var(--text-faint)" }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
