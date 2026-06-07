import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { recommendationsPrompt } from "@/lib/prompts";
import type { Recommendation } from "@/lib/types";
import { safeParseJSON } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brand?: string;
      role?: string;
      category?: string;
      visibilityRate?: number;
      gapQueries?: string[];
      geoScore?: number | null;
      geoTopIssues?: string[];
    };

    const {
      brand,
      role,
      category,
      visibilityRate,
      gapQueries,
      geoScore,
      geoTopIssues,
    } = body;

    if (
      !brand?.trim() ||
      !role?.trim() ||
      !category?.trim() ||
      typeof visibilityRate !== "number"
    ) {
      return NextResponse.json(
        { error: "brand, role, category, and visibilityRate are required" },
        { status: 400 },
      );
    }

    const prompts = recommendationsPrompt({
      brand: brand.trim(),
      role: role.trim(),
      category: category.trim(),
      visibilityRate,
      gapQueries: gapQueries ?? [],
      geoScore: geoScore ?? null,
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
