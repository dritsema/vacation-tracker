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
    const { activityName, category, destinationName } = await req.json();
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are enriching a vacation activity entry. Respond with a JSON object only — no markdown, no explanation.

Required fields:
- "emoji": one emoji that best represents this activity
- "highlights": array of exactly 3 short tags (2-4 words each, e.g. "Outdoor seating", "Cash only", "Reservation needed")
- "address": the real street address of this place (e.g. "671 AZ-89A, Sedona, AZ 86336"). If this is not a specific venue with a fixed address (e.g. "Swimming", "Hiking", or "Relaxing at the hotel"), set address to null.

Activity name: ${activityName}
Category: ${category}
Destination: ${destinationName}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
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

    const raw = data.content[0].text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();
    const enrichment = JSON.parse(raw);

    return new Response(
      JSON.stringify(enrichment),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Enrichment error:", err);
    return new Response(
      JSON.stringify({ error: "Enrichment failed", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
