import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { geoAuditPrompt } from "@/lib/prompts";
import type { GeoAuditApiResponse } from "@/lib/types";
import { mapGeoAuditResponse, safeParseJSON } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brand?: string;
      category?: string;
      content?: string;
    };

    const { brand, category, content } = body;

    if (!brand?.trim() || !category?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "brand, category, and content are required" },
        { status: 400 },
      );
    }

    const prompts = geoAuditPrompt({
      brand: brand.trim(),
      category: category.trim(),
      content: content.trim(),
    });
    const raw = await callLLM(prompts);
    const parsed = safeParseJSON<GeoAuditApiResponse>(raw);

    if (!parsed || typeof parsed.overall_score !== "number") {
      return NextResponse.json(
        { error: "Failed to parse GEO audit from LLM response" },
        { status: 500 },
      );
    }

    return NextResponse.json(mapGeoAuditResponse(parsed));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run GEO audit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
