import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { competitorsPrompt } from "@/lib/prompts";
import { safeParseJSON } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brand?: string;
      category?: string;
    };

    const { brand, category } = body;

    if (!brand?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: "brand and category are required" },
        { status: 400 },
      );
    }

    const prompts = competitorsPrompt({ brand: brand.trim(), category: category.trim() });
    const raw = await callLLM(prompts);
    const parsed = safeParseJSON<string[]>(raw);

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json(
        { error: "Failed to parse competitor list from LLM response" },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed.slice(0, 5));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to detect competitors";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
