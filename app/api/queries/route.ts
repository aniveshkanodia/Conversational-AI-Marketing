import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { defaultQueries, queriesPrompt } from "@/lib/prompts";
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

    const trimmedCategory = category.trim();
    const prompts = queriesPrompt({
      brand: brand.trim(),
      category: trimmedCategory,
    });
    const raw = await callLLM(prompts);
    const parsed = safeParseJSON<string[]>(raw);

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json(defaultQueries(trimmedCategory));
    }

    return NextResponse.json(parsed.slice(0, 10));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate queries";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
