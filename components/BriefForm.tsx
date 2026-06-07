"use client";

import { useState } from "react";
import type { Brief } from "@/lib/types";

export const ROLE_OPTIONS = [
  "Social Media Manager",
  "SEO / GEO Manager",
  "CMO",
  "Brand Manager",
  "Digital Marketing Manager",
  "Head of Growth",
] as const;

export const DEFAULT_BRIEF: Brief = {
  brand: "Hoka",
  role: "SEO / GEO Manager",
  category: "running shoes",
  competitors: [],
  channel: "ai",
  productContent: "",
};

interface BriefFormProps {
  onSubmit: (brief: Brief) => void;
}

export function BriefForm({ onSubmit }: BriefFormProps) {
  const [brand, setBrand] = useState(DEFAULT_BRIEF.brand);
  const [role, setRole] = useState(DEFAULT_BRIEF.role);
  const [category, setCategory] = useState(DEFAULT_BRIEF.category);
  const [competitorsText, setCompetitorsText] = useState("");
  const [channel, setChannel] = useState<Brief["channel"]>(DEFAULT_BRIEF.channel);
  const [productContent, setProductContent] = useState(
    DEFAULT_BRIEF.productContent ?? "",
  );
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!brand.trim() || !role.trim() || !category.trim()) {
      setError("Brand, role, and category are required.");
      return;
    }

    setError("");
    onSubmit({
      brand: brand.trim(),
      role: role.trim(),
      category: category.trim(),
      competitors: competitorsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      channel,
      productContent: productContent.trim() || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          AI Brand Positioning Report
        </h1>
        <p className="mt-3 text-slate-600">
          See how AI chatbots position your brand — visibility, associations,
          competitive gaps, and GEO content optimisation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Brand name
          </label>
          <input
            type="text"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="e.g. Hoka"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Your role
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Product category
          </label>
          <input
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="e.g. running shoes"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Competitors
          </label>
          <input
            type="text"
            value={competitorsText}
            onChange={(event) => setCompetitorsText(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Leave blank to auto-detect"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Discovery channel
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <ChannelCard
              title="AI Chatbots"
              badge="LIVE"
              badgeClass="bg-emerald-100 text-emerald-700"
              selected={channel === "ai"}
              onSelect={() => setChannel("ai")}
            />
            <ChannelCard
              title="Social Media"
              badge="SOON"
              badgeClass="bg-slate-100 text-slate-500"
              disabled
            />
            <ChannelCard
              title="Search / SEO"
              badge="SOON"
              badgeClass="bg-slate-100 text-slate-500"
              disabled
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Paste product page or brand description for GEO audit (optional)
          </label>
          <textarea
            value={productContent}
            onChange={(event) => setProductContent(event.target.value)}
            rows={5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Paste product page copy to unlock the GEO content audit..."
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Generate positioning report →
        </button>
      </form>
    </div>
  );
}

interface ChannelCardProps {
  title: string;
  badge: string;
  badgeClass: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

function ChannelCard({
  title,
  badge,
  badgeClass,
  selected,
  disabled,
  onSelect,
}: ChannelCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`rounded-lg border p-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
          : selected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white hover:border-slate-400"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
        >
          {badge}
        </span>
      </div>
    </button>
  );
}
