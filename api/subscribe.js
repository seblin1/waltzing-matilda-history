// Vercel Serverless Function — stores newsletter signups in Supabase.
// No npm dependencies: uses the built-in fetch and Supabase's REST API.
//
// Required environment variables (set in Vercel → Project → Settings → Environment Variables):
//   SUPABASE_URL                e.g. https://xxxxxxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   the service_role secret key (server-side only — never expose in the browser)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel parses JSON bodies automatically when Content-Type is application/json.
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = (body.email || '').toString().trim().toLowerCase();
    const honeypot = (body.website || '').toString(); // hidden field; bots fill it in

    // Silently accept honeypot hits so bots don't learn anything.
    if (honeypot) return res.status(200).json({ ok: true });

    const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    if (!valid) return res.status(400).json({ error: 'Please enter a valid email address.' });

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return res.status(500).json({ error: 'Server not configured.' });
    }

    // Upsert on the unique email column so repeat signups don't error.
    const resp = await fetch(`${url}/rest/v1/subscribers?on_conflict=email`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ email, source: 'website' }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Supabase insert failed', resp.status, detail);
      return res.status(502).json({ error: 'Could not save right now. Please try again.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
