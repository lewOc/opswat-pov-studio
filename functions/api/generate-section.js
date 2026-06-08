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
    return { error: text || "RAG backend returned a non-JSON response." };
  }
}

const conciseGenerationGuidance = {
  style: "concise, practical, and section-specific",
  maxWords: 140,
  rules: [
    "Only write content needed for the selected PoV section.",
    "Prefer short bullets or compact table entries over long prose.",
    "Focus on the proof-of-value task, validation steps, success measures, and customer context.",
    "Avoid broad marketing copy, long product background, and repeated context already captured elsewhere.",
    "Do not generate a full-document narrative when a single section is requested."
  ]
};

export async function onRequestPost({ request, env }) {
  const ragBaseUrl = normalizeBaseUrl(env.RAG_API_BASE_URL);
  if (!ragBaseUrl) {
    return json(
      {
        error:
          "RAG generation is not configured. Add RAG_API_BASE_URL to this Pages project and point it at the rag-pipeline service."
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

  if (!body?.section?.ai?.target || !body?.intake) {
    return json({ error: "Missing section or intake context." }, 400);
  }

  const headers = { "Content-Type": "application/json" };
  if (env.RAG_ACCESS_TOKEN) headers["X-Access-Token"] = env.RAG_ACCESS_TOKEN;

  let upstream;
  try {
    upstream = await fetch(`${ragBaseUrl}/api/pov/section-draft`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...body,
        generationGuidance: {
          ...conciseGenerationGuidance,
          ...(body.generationGuidance || {})
        }
      })
    });
  } catch (error) {
    return json({ error: `Could not reach RAG backend: ${error.message}` }, 502);
  }

  const payload = await readUpstreamResponse(upstream);
  if (!upstream.ok) {
    return json(
      { error: payload.error || payload.description || "RAG section generation failed." },
      upstream.status
    );
  }

  return json({
    target: payload.target || body.section.ai.target,
    draft: payload.draft || "",
    rows: Array.isArray(payload.rows) ? payload.rows : [],
    citations: Array.isArray(payload.citations) ? payload.citations : [],
    sources: payload.sources || { rag: [] }
  });
}
