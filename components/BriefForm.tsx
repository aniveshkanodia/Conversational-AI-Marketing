"use client";

import { useState } from "react";
import { EXTERNAL_AUDITOR_ROLE, type Brief } from "@/lib/types";
import { isValidUrl } from "@/lib/utils";

const SAMPLE_CONTENT = `Hoka running shoes are built for runners who want maximum cushioning without extra weight. Our Meta-Rocker geometry promotes a smooth heel-to-toe transition, and the extended heel design helps reduce impact on long runs. Popular models include the Clifton for everyday training and the Bondi for maximum cushioning.`;

export const DEFAULT_BRIEF: Brief = {
  brand: "Hoka",
  role: EXTERNAL_AUDITOR_ROLE,
  brandUrl: "https://www.hoka.com",
  competitors: [],
  productContent: SAMPLE_CONTENT,
};

interface BriefFormProps {
  onSubmit: (brief: Brief) => void;
}

export function BriefForm({ onSubmit }: BriefFormProps) {
  const [brand, setBrand] = useState(DEFAULT_BRIEF.brand);
  const [brandUrl, setBrandUrl] = useState(DEFAULT_BRIEF.brandUrl);
  const [competitorsText, setCompetitorsText] = useState("");
  const [productContent, setProductContent] = useState(
    DEFAULT_BRIEF.productContent,
  );
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!brand.trim() || !brandUrl.trim()) {
      setError("Brand name and brand URL are required.");
      return;
    }

    if (!isValidUrl(brandUrl.trim())) {
      setError("Enter a valid URL starting with http:// or https://.");
      return;
    }

    if (!productContent.trim()) {
      setError("Product or brand content is required for the GEO audit.");
      return;
    }

    setError("");
    onSubmit({
      brand: brand.trim(),
      role: EXTERNAL_AUDITOR_ROLE,
      brandUrl: brandUrl.trim(),
      competitors: competitorsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      productContent: productContent.trim(),
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          AI Brand Positioning Audit
        </h1>
        <p className="mt-3 text-slate-600">
          Audit how well your brand&apos;s online content is structured for AI
          discovery and citation.
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
            Brand URL
          </label>
          <input
            type="url"
            value={brandUrl}
            onChange={(event) => setBrandUrl(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="e.g. https://www.hoka.com"
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
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Product page or brand description
          </label>
          <textarea
            value={productContent}
            onChange={(event) => setProductContent(event.target.value)}
            rows={5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Paste homepage, product page, or brand description copy..."
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Run Audit
        </button>
      </form>
    </div>
  );
}
