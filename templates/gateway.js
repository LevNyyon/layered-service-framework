// A GATEWAY: the boundary to ONE external service. No reasoning, no LLM (except the
// dedicated `llm` gateway), no calling another gateway. JSON in, JSON out.
export default {
  slug: 'example',                              // unique id -> GATEWAYS.example
  service: 'What external service this wraps',
  description: 'One sentence.',
  modes: ['live'],                              // blank | mock | manual | live
  input: { field: 'string' },
  output: { field: 'string' },
  configFields: [                               // operator-set config; [] if none
    { key: 'api_key', label: 'API key', type: 'secret', required: true },
  ],

  async call(env, input = {}) {
    // const cfg = await getConfig(env, 'example');   // read config if configFields
    // Fetch the service, translate the response, return JSON. Do NOT reason.
    const r = await fetch('https://api.example.com/v1/thing', {
      headers: { /* authorization from cfg */ },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return { error: `example ${r.status}` };
    const data = await r.json();
    return { field: data.field };
  },
};
// Register: add `example` to the GATEWAYS object in gateways/index.js.
