import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { geoAuditPrompt } from "@/lib/prompts";
import type { GeoAuditApiResponse } from "@/lib/types";
import { isValidUrl, mapGeoAuditResponse, safeParseJSON } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brand?: string;
      brandUrl?: string;
      content?: string;
      competitors?: string[];
    };

    const { brand, brandUrl, content, competitors } = body;

    if (!brand?.trim() || !brandUrl?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "brand, brandUrl, and content are required" },
        { status: 400 },
      );
    }

    if (!isValidUrl(brandUrl.trim())) {
      return NextResponse.json(
        { error: "brandUrl must be a valid http or https URL" },
        { status: 400 },
      );
    }

    const prompts = geoAuditPrompt({
      brand: brand.trim(),
      brandUrl: brandUrl.trim(),
      content: content.trim(),
      competitors: competitors ?? [],
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
