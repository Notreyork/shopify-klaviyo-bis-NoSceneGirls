export default async function handler(req, res) {
  // Allow CORS from any origin (or restrict to your Shopify domain)
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { email, variant_id, product_name, product_url } = req.body;

  if (!email || !variant_id) return res.status(400).json({ success: false });

  try {
    const response = await fetch('https://a.klaviyo.com/api/v1/back-in-stock-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Klaviyo-API-Key pk_b07ff9fa9fa139380dfca4a36aad74f46b'
      },
      body: JSON.stringify({
        profiles: [{ email }],
        properties: { variant_id, product_name, product_url }
      })
    });

    const data = await response.json();
    res.status(response.ok ? 200 : 500).json({ success: response.ok, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}