res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'votes.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (req.method === 'POST') {
    const rating = parseInt(req.body.rating);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }

    data.votes.push(rating);
    data.total = data.votes.length;
    data.avg = data.votes.reduce((a, b) => a + b, 0) / data.total;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return res.status(200).json({
      success: true,
      avg: data.avg,
      votes: data.total
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      avg: data.avg,
      votes: data.total
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

