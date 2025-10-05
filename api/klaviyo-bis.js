import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, variantId, productId } = req.body;

    if (!email || !variantId || !productId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Build payload for Klaviyo API
    const payload = {
      data: {
        type: "back-in-stock-subscription",
        attributes: {
          profile: { email },
          channels: ["EMAIL"],
        },
        relationships: {
          variant: {
            data: {
              type: "catalog-variant",
              id: `shopify://${productId}?variant=${variantId}`,
            },
          },
        },
      },
    };

    const klaviyoRes = await fetch(
      "https://a.klaviyo.com/api/back-in-stock-subscriptions",
      {
        method: "POST",
        headers: {
          accept: "application/vnd.api+json",
          revision: "2025-07-15",
          "content-type": "application/vnd.api+json",
          Authorization: "Klaviyo-API-Key UwqfMQ", // PRIVATE key
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await klaviyoRes.json();

    if (!klaviyoRes.ok) {
      return res.status(klaviyoRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
