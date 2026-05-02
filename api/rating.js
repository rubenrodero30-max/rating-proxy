import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    const votes = await redis.get("votes") || 0;
    const total = await redis.get("total") || 0;

    const avg = votes === 0 ? 0 : total / votes;

    return res.status(200).json({
      avg: Number(avg.toFixed(2)),
      votes,
    });
  }

  if (req.method === "POST") {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating inválido" });
    }

    const votes = await redis.incr("votes");
    const total = await redis.incrby("total", rating);

    const avg = total / votes;

    return res.status(200).json({
      avg: Number(avg.toFixed(2)),
      votes,
    });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
