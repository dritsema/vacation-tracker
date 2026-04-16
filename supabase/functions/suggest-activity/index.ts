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
    const { destinationName, context, existingNames, category } = await req.json();
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const foursquareKey = Deno.env.get("FOURSQUARE_API_KEY");

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isFoodCategory = category === "breakfast" || category === "lunch" || category === "dinner";
    const existingSet = new Set((existingNames ?? []).map((n: string) => n.toLowerCase()));
    const existing = existingNames?.length
      ? `Already on the list (do not suggest these): ${existingNames.join(", ")}`
      : "";

    let prompt: string;

    if (isFoodCategory && foursquareKey) {
      // ── Food categories: Foursquare → Haiku notes ──────────────────────

      const params = new URLSearchParams({
        query: context,
        near: destinationName,
        limit: "6",
        sort: "RELEVANCE",
        categories: "13000", // Foursquare food parent category
      });

      const fsqRes = await fetch(
        `https://api.foursquare.com/v3/places/search?${params}`,
        { headers: { Authorization: `apikey ${foursquareKey}` } }
      );
      const fsqData = await fsqRes.json();

      if (!fsqRes.ok) {
        console.error("Foursquare error:", JSON.stringify(fsqData));
        return new Response(
          JSON.stringify({ error: "Foursquare API error", detail: fsqData }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const businesses = (fsqData.results ?? [])
        .filter((b: any) => !existingSet.has(b.name.toLowerCase()))
        .slice(0, 3);

      if (businesses.length === 0) {
        return new Response(
          JSON.stringify({ error: "No results found. Try different search terms." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const venueList = businesses.map((b: any, i: number) => {
        const cats = b.categories?.map((c: any) => c.name).join(", ") ?? "";
        const addr = b.location?.formatted_address ?? "";
        const rating = b.rating ? `${b.rating}/10` : "";
        return `${i + 1}. ${b.name}${rating ? ` (${rating})` : ""}${cats ? ` — ${cats}` : ""}${addr ? ` — ${addr}` : ""}`;
      }).join("\n");

      prompt = `You are matching real verified venues to a user's vacation request. Do not invent or add any information not present in the venue data below.

For each venue, respond with:
- "name": exact venue name as listed
- "category": one of "breakfast", "lunch", "activity", "dinner" — infer from venue type and the user's request
- "notes": 1-2 sentences explaining how this venue matches the user's request, based only on the data provided

Respond with a JSON array only — no markdown, no explanation.

User's request: ${context}
Destination: ${destinationName}

Verified venues from Foursquare:
${venueList}`;

    } else {
      // ── Activity category or no category: Haiku only ───────────────────

      const categoryRule = category
        ? `All 3 suggestions must use the category: "${category}".`
        : "Choose the most appropriate category for each suggestion.";

      prompt = `You are a knowledgeable local vacation advisor for ${destinationName}. Suggest exactly 3 specific venues or activities that directly satisfy ALL of the user's stated requirements.

Rules:
- Only suggest places you are highly confident actually exist and are findable on Google Maps. Do not invent names.
- If the user mentions a specific landmark, view, or location, ALL 3 suggestions must be relevant to it.
- The "notes" field must explain exactly how this suggestion matches what was asked for.
- ${categoryRule}

Respond with a JSON array only — no markdown, no explanation.

Each item must have:
- "name": specific venue or activity name
- "category": one of "breakfast", "lunch", "activity", "dinner"
- "notes": 1-2 sentences explaining specifically how this matches what was asked for

Destination: ${destinationName}
User request: ${context}
${existing}`;
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const anthropicData = await anthropicRes.json();

    if (!anthropicRes.ok || anthropicData.error) {
      console.error("Anthropic API error:", JSON.stringify(anthropicData));
      return new Response(
        JSON.stringify({ error: "Anthropic API error", detail: anthropicData.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const raw = anthropicData.content[0].text
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
