export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();

  // Optional: if you set CRON_SECRET in Vercel, Vercel Cron sends it automatically.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "not configured" });

  const gate = await allowed(req, "keepalive", 10, 50);
  if (!gate.ok) return res.status(429).json({ error: "limit" });

  try {
    const r = await fetch(url.replace(/\/$/, "") + "/rest/v1/rpc/ping", {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!r.ok) throw new Error("Supabase HTTP " + r.status);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Keepalive failed:", err);
    return res.status(502).json({ ok: false });
  }}
