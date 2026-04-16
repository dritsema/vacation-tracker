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
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existing = existingNames?.length
      ? `Already on the list (do not suggest these): ${existingNames.join(", ")}`
      : "";

    const prompt = `You are a vacation activity advisor. Based on the destination and preferences, suggest exactly 3 specific activities.

Respond with a JSON array only — no markdown, no explanation.

Each item must have:
- "name": specific venue or activity name (e.g. "Coffee Pot Restaurant", "Cathedral Rock Trail")
- "category": one of "breakfast", "lunch", "activity", "dinner"
- "notes": 1-2 sentences explaining why this is a great choice for the stated preferences

Destination: ${destinationName}
Preferences: ${context}
${existing}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 512 },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Gemini API error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Gemini API error", detail: data.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const raw = data.candidates[0].content.parts[0].text
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
