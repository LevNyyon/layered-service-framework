// A WORKFLOW: an ordered list of EXISTING shared tools. No business rules, no branching.
// A generic runner threads a shared context through the steps: each tool's output merges
// into the context for the next. Rules belong in a knowledge note the tool reads, not here.
//
// Add this entry to the WORKFLOWS registry (workflows/index.js):

export const example_workflow = {
  name: 'Example flow',
  goal: 'what it produces, in one line',
  steps: ['tool_a', 'tool_b', 'tool_c'], // all must already exist in the shared TOOLS pool
};
