import { Redis } from "@upstash/redis";

export const config = {
  runtime: "edge",
};

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN,
});

export default async function handler(req) {
  const origin = req.headers.get("origin") || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://rutarp.great-site.net",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method === "GET") {
    const votes = (await redis.get("votes")) || 0;
    const total = (await redis.get("total")) || 0;
    const avg = votes === 0 ? 0 : total / votes;

    return new Response(
      JSON.stringify({ avg: Number(avg.toFixed(2)), votes }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (req.method === "POST") {
    const body = await req.json();
    const rating = body.rating;

    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: "Rating inválido" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    await redis.incr("votes");
    await redis.incrby("total", rating);

    const votes = (await redis.get("votes")) || 0;
    const total = (await redis.get("total")) || 0;
    const avg = votes === 0 ? 0 : total / votes;

    return new Response(
      JSON.stringify({ avg: Number(avg.toFixed(2)), votes }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  return new Response("Método no permitido", { status: 405, headers: corsHeaders });
}
