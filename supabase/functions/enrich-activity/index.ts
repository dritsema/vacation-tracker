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
- "maps_query": Google Maps search string to locate this place (e.g. "Cowboy Club Sedona AZ"). If this is not a specific venue or location (e.g. "Swimming" or "Relaxing at the hotel"), set maps_query to null.

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
    const enrichment = JSON.parse(data.content[0].text);

    return new Response(
      JSON.stringify(enrichment),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Enrichment failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
