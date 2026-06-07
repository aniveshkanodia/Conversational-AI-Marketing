import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { recommendationsPrompt } from "@/lib/prompts";
import type { Recommendation } from "@/lib/types";
import { isValidUrl, safeParseJSON } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brand?: string;
      role?: string;
      brandUrl?: string;
      competitors?: string[];
      geoScore?: number;
      geoTopIssues?: string[];
    };

    const { brand, role, brandUrl, competitors, geoScore, geoTopIssues } = body;

    if (
      !brand?.trim() ||
      !role?.trim() ||
      !brandUrl?.trim() ||
      typeof geoScore !== "number"
    ) {
      return NextResponse.json(
        { error: "brand, role, brandUrl, and geoScore are required" },
        { status: 400 },
      );
    }

    if (!isValidUrl(brandUrl.trim())) {
      return NextResponse.json(
        { error: "brandUrl must be a valid http or https URL" },
        { status: 400 },
      );
    }

    const prompts = recommendationsPrompt({
      brand: brand.trim(),
      role: role.trim(),
      brandUrl: brandUrl.trim(),
      competitors: competitors ?? [],
      geoScore,
      geoTopIssues: geoTopIssues ?? [],
    });

    const raw = await callLLM(prompts);
    const parsed = safeParseJSON<Recommendation[]>(raw);

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json(
        { error: "Failed to parse recommendations from LLM response" },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed.slice(0, 5));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate recommendations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
