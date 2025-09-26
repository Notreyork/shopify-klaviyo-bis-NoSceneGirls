export default async function handler(req, res) {
  // ✅ CORS headers so Shopify can call this function
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  // Parse JSON body
  let body = {};
  try {
    body = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }

  const { email, variant_id, product_name, product_url } = body;

  if (!email || !variant_id) return res.status(400).json({ success: false, message: 'Missing email or variant_id' });

  try {
    // ✅ Send to Klaviyo Back in Stock API
    const response = await fetch('https://a.klaviyo.com/api/v1/back-in-stock-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Klaviyo-API-Key pk_b07ff9fa9fa139380dfca4a36aad74f46b'
      },
      body: JSON.stringify({
        profiles: [{ email }],
        properties: {
          variant_id: parseInt(variant_id), // must be integer
          product_name,
          product_url
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ success: true, data });
    } else {
      console.error('Klaviyo API error:', data);
      res.status(500).json({ success: false, data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}