// A TOOL: does ONE job. Reaches external services ONLY through gateways. Lives in the
// shared pool so every module can use it. May reason via the `llm` gateway. Never calls
// another tool (compose those in a workflow).
import { GATEWAYS } from '../gateways/index.js';
import { logEvent } from '../lib/events.js'; // only if it mutates state

export default {
  name: 'do_one_thing',
  description: 'One sentence: the single job this does.',
  input: { field: 'string' },
  output: { result: 'string' },
  gateways: ['example'],                       // list EVERY gateway it calls

  async run(env, { field } = {}) {
    const r = await GATEWAYS.example.call(env, { field });
    if (r.error) return { error: r.error };
    // if it mutates state:
    // await logEvent(env, 'thing.done', 'bot', { field });
    return { result: r.field };
  },
};
// Register: add `do_one_thing` to the TOOLS object in tools/index.js.
