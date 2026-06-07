import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { queryPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      query?: string;
      category?: string;
    };

    const { query, category } = body;

    if (!query?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: "query and category are required" },
        { status: 400 },
      );
    }

    const prompts = queryPrompt({
      query: query.trim(),
      category: category.trim(),
    });
    const response = await callLLM(prompts);

    return NextResponse.json({ response });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
