// nyyon-lite layer enforcement for JS/TS hosts, via dependency-cruiser.
// One-shot, no install:
//   npx --yes dependency-cruiser --config .dependency-cruiser.cjs gateways tools workflows modules
// (add -T err-html -f dep-report.html for a graph)
//
// Layers, high to low: modules(4) > workflows(3) > tools(2) > gateways(1) > knowledge/activity(0).
// The rule: a layer may import ONLY from the layer(s) below it, and only through that layer's index.
// FSD mapping:
//   *-reaches-only-*        == FSD forbidden-imports (no upward, no sideways into a peer layer)
//   no-sibling-tool-to-tool == FSD no-cross-imports (siblings in one layer can't reach each other)
//   only-through-index      == FSD no-public-api-sidestep (import the layer index, not its internals)

module.exports = {
  forbidden: [
    {
      name: "gateway-reaches-nothing-above",
      comment: "GATEWAY (layer 1) talks to ONE external service only. No tools/workflows/modules imports, and no other gateway.",
      severity: "error",
      from: { path: "^gateways/" },
      to: { path: "^(tools|workflows|modules)/" },
    },
    {
      name: "tool-reaches-only-gateways",
      comment: "TOOL (layer 2) reaches services ONLY via the gateways index. No workflows/modules imports.",
      severity: "error",
      from: { path: "^tools/" },
      to: { path: "^(workflows|modules)/" },
    },
    {
      name: "no-sibling-tool-to-tool",
      comment: "A TOOL never calls another tool. Compose sequences in a workflow. (FSD: no-cross-imports)",
      severity: "error",
      from: { path: "^tools/(?!index\\.)" },
      to: { path: "^tools/(?!index\\.)" },
    },
    {
      name: "workflow-reaches-only-tools",
      comment: "WORKFLOW (layer 3) is an ordered list of EXISTING tools. It imports tools only, no gateways/modules.",
      severity: "error",
      from: { path: "^workflows/" },
      to: { path: "^(gateways|modules)/" },
    },
    {
      name: "module-reaches-only-tools-and-gateways",
      comment: "MODULE (layer 4) uses shared tools and gateways only. No workflows, no other module's internals, no raw imports.",
      severity: "error",
      from: { path: "^modules/" },
      to: { path: "^workflows/" },
    },
    {
      name: "only-through-index",
      comment: "Reach a lower layer through its index/registry, not by deep-importing its internals. (FSD: no-public-api-sidestep)",
      severity: "error",
      from: { pathNot: "/(index|registry)\\.(js|ts|mjs|jsx|tsx)$" },
      to: {
        path: "^(gateways|tools|workflows)/(?!index\\.)[^/]+\\.(js|ts|mjs|jsx|tsx)$",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    exclude: { path: "(^|/)(node_modules|scripts|templates|\\.git)/" },
    reporterOptions: {
      dot: { collapsePattern: "^(gateways|tools|workflows|modules)/[^/]+" },
    },
  },
};
