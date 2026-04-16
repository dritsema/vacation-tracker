import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { destinationName, context, existingNames } = await req.json();
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existing = existingNames?.length
      ? `Already on the list (do not suggest these): ${existingNames.join(", ")}`
      : "";

    const prompt = `You are a knowledgeable local vacation advisor for ${destinationName}. Suggest exactly 3 specific venues or activities that directly satisfy ALL of the user's stated requirements.

Rules you must follow:
- If the user mentions a meal type (lunch, breakfast, dinner), ALL 3 suggestions must use that category — never suggest a hike or activity when food was requested
- If the user mentions a specific landmark, view, or location, ALL 3 suggestions must be relevant to it
- Suggest real, specific named venues — not generic descriptions
- The "notes" field must explain exactly how this suggestion satisfies the stated preferences — this is how you verify your own answer

Respond with a JSON array only — no markdown, no explanation.

Each item must have:
- "name": specific venue or activity name
- "category": one of "breakfast", "lunch", "activity", "dinner"
- "notes": 1-2 sentences explaining specifically how this matches what was asked for

Destination: ${destinationName}
User request: ${context}
${existing}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Anthropic API error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Anthropic API error", detail: data.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const raw = data.content[0].text
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/\n?```$/, "")
      .trim();
    const suggestions = JSON.parse(raw);

    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Suggest error:", err);
    return new Response(
      JSON.stringify({ error: "Suggest failed", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
