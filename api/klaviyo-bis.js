// api/klaviyo-bis.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read request body
    const rawBody = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => data += chunk);
      req.on("end", () => resolve(data));
      req.on("error", err => reject(err));
    });

    const body = JSON.parse(rawBody); // <-- Parse JSON safely
    const { email, variantId, productId } = body;

    if (!email || !variantId || !productId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const payload = {
      data: {
        type: "back-in-stock-subscription",
        attributes: {
          profile: { email },
          channels: ["EMAIL"]
        },
        relationships: {
          variant: {
            data: {
              type: "catalog-variant",
              id: `shopify://${productId}?variant=${variantId}`
            }
          }
        }
      }
    };

    const klaviyoRes = await fetch(
      "https://a.klaviyo.com/api/back-in-stock-subscriptions",
      {
        method: "POST",
        headers: {
          accept: "application/vnd.api+json",
          revision: "2025-07-15",
          "content-type": "application/vnd.api+json",
          Authorization: "Klaviyo-API-Key UwqfMQ" // Private key
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await klaviyoRes.json();

    if (!klaviyoRes.ok) return res.status(klaviyoRes.status).json(data);

    return res.status(200).json(data);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
