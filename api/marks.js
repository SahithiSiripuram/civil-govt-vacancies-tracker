// Stores Anush's per-vacancy status marks so they follow him to any browser.
//
// There is no login and no key: a single shared record, because exactly one
// person uses this tracker. The page falls back to localStorage whenever this
// endpoint is unavailable or not yet configured, so the site works regardless.
//
// Requires an Upstash Redis store connected to the Vercel project. Vercel's
// Upstash integration sets KV_REST_API_* ; a manual Upstash setup sets
// UPSTASH_REDIS_REST_* . Either is accepted.

const REST_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const RECORD_KEY = "anush:marks";
const MAX_BYTES = 64 * 1024; // a few hundred marks; refuses anything absurd

// Upstash's REST API takes a command as a JSON array: ["GET", "key"].
async function redis(command) {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  if (!res.ok) throw new Error(`Upstash responded ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(body.error);
  return body.result;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!REST_URL || !REST_TOKEN) {
    // Not an error the user needs to see — the page just stays on localStorage.
    return res.status(501).json({ error: "storage not configured" });
  }

  try {
    if (req.method === "GET") {
      const raw = await redis(["GET", RECORD_KEY]);
      return res.status(200).json(raw ? JSON.parse(raw) : {});
    }

    if (req.method === "POST") {
      const marks =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (!marks || typeof marks !== "object" || Array.isArray(marks)) {
        return res.status(400).json({ error: "expected an object of marks" });
      }

      const serialized = JSON.stringify(marks);
      if (serialized.length > MAX_BYTES) {
        return res.status(413).json({ error: "payload too large" });
      }

      // Values are constrained to the four known statuses, so a malformed or
      // hostile payload cannot turn this record into arbitrary storage.
      const allowed = new Set(["applied", "not-eligible", "not-interested"]);
      for (const value of Object.values(marks)) {
        if (!allowed.has(value)) {
          return res.status(400).json({ error: `unknown status: ${value}` });
        }
      }

      await redis(["SET", RECORD_KEY, serialized]);
      return res.status(200).json({ ok: true, count: Object.keys(marks).length });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
}
