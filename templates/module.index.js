// A MODULE: a product area. Owns routes + a visualization (a page). Uses shared tools and
// gateways, never private ones, never a raw fetch. Registered in the module registry.
import { GATEWAYS } from '../../gateways/index.js';
import { runTool } from '../../tools/index.js';
import { logEvent } from '../../lib/events.js';

const manifest = {
  slug: 'thing',
  name: 'Thing',
  surface: 'thing',            // maps to the page in the UI
  description: 'One sentence.',
};

function registerRoutes(app) {
  app.get('/api/thing', async (c) => {
    const { rows } = await GATEWAYS.some_store.call(c.env, { op: 'list' });
    return c.json({ items: rows || [] });
  });

  app.post('/api/thing/do', async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const res = await runTool(c.env, 'do_one_thing', { field: b.field }); // shared tool
    await logEvent(c.env, 'thing.did', 'operator', { ok: !res.error });
    return c.json(res);
  });
}

// listeners: react to the activity bus, e.g. [{ kind: 'other.event', handler: async (env, ev) => {} }]
export default { manifest, registerRoutes, listeners: [] };
// Register: add this module to the MODULES array in registry.js, and ship its page
// (see module.page.jsx) wired to manifest.surface in the PAGES map.
