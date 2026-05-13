// ============================================================
// MyBirdFinder — Netlify Serverless Function
// Accepts a base64 image and asks Claude to identify the bird.
// The API key lives only here (server-side) — never in the browser.
// ============================================================

const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { imageData, mediaType } = body;
  if (!imageData || !mediaType) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing imageData or mediaType' }) };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are an expert ornithologist and bird identification assistant for the app MyBirdFinder.

Look at this image carefully and determine:
1. Is there a bird in this image?
2. If yes, what species is it?

Respond ONLY with a valid JSON object in this exact format — no markdown, no explanation, just the JSON:

If it IS a bird:
{
  "isBird": true,
  "commonName": "American Robin",
  "scientificName": "Turdus migratorius",
  "confidence": "certain",
  "notes": "Identified by the distinctive orange-red breast and dark grey back. Classic backyard bird across North America.",
  "funFact": "American Robins are often the first sign of spring — they return north earlier than most migratory birds!"
}

If it is NOT a bird:
{
  "isBird": false,
  "whatIsIt": "a tabby cat"
}

Confidence must be one of: "certain", "pretty sure", "maybe", "unknown".
If the image is too blurry or unclear to identify confidently, use a lower confidence.
If it's clearly a bird but you can't identify the exact species, use commonName "Unknown Bird" and your best genus/family for scientificName.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const raw = response.content[0].text.trim();

    // Strip markdown code fences if Claude adds them anyway
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/,'').trim();
    const result = JSON.parse(cleaned);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('identify-bird error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Identification failed', detail: err.message }),
    };
  }
};
