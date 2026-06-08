function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

async function readUpstreamResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || "Product Knowledge API returned a non-JSON response." };
  }
}

const allowedActions = {
  productFit: "/api/product-fit",
  productsSearch: "/api/products/search",
  capabilitiesSearch: "/api/capabilities/search",
  evidenceSearch: "/api/evidence/search"
};

export async function onRequestPost({ request, env }) {
  const baseUrl = normalizeBaseUrl(env.PRODUCT_KNOWLEDGE_API_BASE_URL);
  if (!baseUrl) {
    return json(
      {
        error:
          "Product Knowledge API is not configured. Add PRODUCT_KNOWLEDGE_API_BASE_URL to this Pages project."
      },
      503
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const action = body?.action || "productFit";
  const endpoint = allowedActions[action];
  if (!endpoint) {
    return json({ error: "Unsupported Product Knowledge action." }, 400);
  }

  const payload = body?.payload || {};
  const headers = { "Content-Type": "application/json" };
  if (env.PRODUCT_KNOWLEDGE_ACCESS_TOKEN) headers["X-Access-Token"] = env.PRODUCT_KNOWLEDGE_ACCESS_TOKEN;

  let upstream;
  try {
    upstream = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return json({ error: `Could not reach Product Knowledge API: ${error.message}` }, 502);
  }

  const responsePayload = await readUpstreamResponse(upstream);
  if (!upstream.ok) {
    return json(
      { error: responsePayload.error || responsePayload.description || "Product Knowledge request failed." },
      upstream.status
    );
  }

  return json(responsePayload);
}
