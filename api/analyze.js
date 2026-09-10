// Vercel serverless function.
// Keeps the Anthropic API key on the server — never expose it in frontend code.
// Configure ANTHROPIC_API_KEY in your Vercel project's Environment Variables.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured yet — frontend will fall back to a local summary.
    res.status(200).json({ text: null, reason: 'no_key' });
    return;
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      res.status(200).json({ text: null, reason: 'api_error' });
      return;
    }

    const data = await response.json();
    const text = (data.content || [])
      .map((b) => (b.type === 'text' ? b.text : ''))
      .filter(Boolean)
      .join('\n')
      .trim();

    res.status(200).json({ text: text || null });
  } catch (e) {
    console.error('analyze function failed:', e);
    res.status(200).json({ text: null, reason: 'exception' });
  }
}
