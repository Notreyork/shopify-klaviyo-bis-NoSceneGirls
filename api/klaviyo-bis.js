export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  let body = {};

  // Safely parse JSON
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body; // already parsed object
    }
    console.log('Request body:', body);
  } catch (err) {
    console.error('JSON parse error:', err);
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }

  const { email, variant_id, product_name, product_url } = body;

  if (!email || !variant_id) {
    console.error('Missing email or variant_id');
    return res.status(400).json({ success: false, message: 'Missing email or variant_id' });
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/v1/back-in-stock-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Klaviyo-API-Key pk_b07ff9fa9fa139380dfca4a36aad74f46b'
      },
      body: JSON.stringify({
        profiles: [{ email }],
        properties: {
          variant_id: parseInt(variant_id),
          product_name,
          product_url
        }
      })
    });

    const data = await response.json();
    console.log('Klaviyo response:', data);

    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(500).json({ success: false, data });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}