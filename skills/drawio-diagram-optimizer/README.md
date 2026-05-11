# drawio-diagram-optimizer

A GitHub Copilot skill for generating and optimizing draw.io diagrams from natural language descriptions.

## Goal

Convert natural language descriptions of systems, architectures, and workflows into well-structured, readable draw.io diagrams. The skill outputs a structured JSON representation that can be rendered into draw.io XML using the included renderer and CLI.

## Input contract

The skill accepts a natural language description of the diagram to generate or optimize, along with optional configuration hints.

```json
{
  "task": "generate_or_optimize_drawio_diagram",
  "input": {
    "description": "A description of the system, workflow, or architecture to diagram.",
    "diagramType": "architecture | flowchart | sequence | er | mindmap",
    "layoutDirection": "TB | LR | BT | RL",
    "constraints": {
      "maxNodesPerGroup": 8,
      "preferShortLabels": true,
      "splitComplexDiagrams": true
    }
  }
}
```

## Output contract

The skill returns a structured diagram JSON object:

```json
{
  "title": "diagram title",
  "diagramType": "architecture",
  "layoutDirection": "TB",
  "groups": [...],
  "nodes": [...],
  "edges": [...],
  "annotations": [...]
}
```

## Non-goals

- High-fidelity pixel-perfect UI mockups
- Strict BPMN 2.0 compliance
- Complex free-form topology with arbitrary edge routing
- Direct production of draw.io XML (JSON is the primary output)

## Core principles

1. **Clarity over completeness**: Prefer readable diagrams over exhaustive ones.
2. **Short labels**: Use `shortLabel` for node display; keep full detail in `label` and annotations.
3. **Group before layout**: Always assign nodes to groups before positioning.
4. **Split when complex**: Recommend splitting into multiple diagrams rather than cramming everything into one.
5. **Validate structure**: Self-check references before returning output.

## System prompt

See [`prompt.md`](./prompt.md) for the full system prompt used with this skill.

## Schema

See [`schema.json`](./schema.json) for the full JSON schema for both input and output.

## Evaluation criteria

See [`evaluator.md`](./evaluator.md) for quality evaluation rubric and acceptance criteria.

## Renderer and CLI

See [`drawio-renderer.ts`](./drawio-renderer.ts) for the TypeScript renderer implementation.
See [`cli.ts`](./cli.ts) for the CLI entry point.

## Examples

- Input: [`examples/example-input.json`](./examples/example-input.json)
- Output: [`examples/example-output.json`](./examples/example-output.json)

## Quick start

```bash
cd skills/drawio-diagram-optimizer
npm install
npm run build
npm test
npm run render:example
```

## Acceptance criteria

A diagram output is accepted when:

- [ ] All node IDs are unique
- [ ] All group IDs are unique
- [ ] All edge sources and targets reference existing nodes
- [ ] All annotation targets reference existing nodes
- [ ] All nodes belong to a valid group
- [ ] `shortLabel` is ≤ 12 characters for most nodes
- [ ] The renderer can produce valid XML without errors
- [ ] The XML can be imported into draw.io without errors
