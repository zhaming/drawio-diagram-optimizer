# drawio-diagram-optimizer evaluator

This document defines the quality evaluation criteria and automated acceptance rules for diagrams produced by the `drawio-diagram-optimizer` skill.

## Automated validation (must pass)

These checks are enforced by the renderer and must pass before any diagram is accepted:

| Check | Rule |
|-------|------|
| Unique group IDs | All `groups[].id` values must be unique |
| Unique node IDs | All `nodes[].id` values must be unique |
| Valid group references | Every `nodes[].groupId` must match a `groups[].id` |
| Valid edge sources | Every `edges[].source` must match a `nodes[].id` |
| Valid edge targets | Every `edges[].target` must match a `nodes[].id` |
| Valid annotation targets | Every `annotations[].targetId` must match a `nodes[].id` |
| Non-empty title | `title` must be a non-empty string |
| Non-empty groups | `groups` array must contain at least one entry |
| Non-empty nodes | `nodes` array must contain at least one entry |

## Label quality (should pass)

| Check | Rule | Severity |
|-------|------|----------|
| Short label length | `shortLabel` ≤ 20 characters | Warning |
| Preferred short label | `shortLabel` ≤ 12 characters for non-decision nodes | Info |
| Decision label brevity | `shortLabel` ≤ 8 characters for `type: "decision"` nodes | Warning |
| No raw newlines in labels | `shortLabel` must not contain `\n` | Error |

## Structural quality (should pass)

| Check | Rule | Severity |
|-------|------|----------|
| Group count | Between 1 and 8 groups | Warning if outside range |
| Nodes per group | Between 1 and 8 nodes per group | Warning if outside range |
| Total node count | ≤ 30 nodes total | Warning if exceeded |
| Total edge count | ≤ 40 edges total | Warning if exceeded |
| No isolated nodes | Every node should have at least one connected edge | Warning |
| No self-loops | `edges[].source` must not equal `edges[].target` | Error |

## Style consistency (should pass)

| Check | Rule | Severity |
|-------|------|----------|
| Consistent node sizes | Nodes of the same `type` should have the same width and height | Info |
| Valid styleRole values | `styleRole` must be one of the allowed enum values | Error |
| Valid layoutHint | Group `layoutHint` must be one of: `vertical`, `horizontal`, `grid` | Error |

## Human evaluation rubric

When evaluating diagram quality manually, use the following rubric:

### Readability (0–3 points)
- **3**: All node labels are clearly readable; no text overflow; decision nodes are concise
- **2**: Most labels are readable; minor truncation on 1–2 nodes
- **1**: Several nodes have long or cluttered labels
- **0**: Many nodes are unreadable or severely truncated

### Layout clarity (0–3 points)
- **3**: Groups are clearly separated; main flow is easy to follow top-to-bottom or left-to-right
- **2**: Most groups are clear; one area of the diagram feels cluttered
- **1**: Groups overlap or are hard to distinguish; flow direction is unclear
- **0**: No clear structure; layout is confusing

### Structural accuracy (0–3 points)
- **3**: Diagram accurately represents the described system; all major components and flows are present
- **2**: Most components are present; 1–2 minor omissions or inaccuracies
- **1**: Several important components or flows are missing
- **0**: Diagram does not represent the described system

### Annotation quality (0–1 point)
- **1**: Annotations are used appropriately to explain complex nodes; text is concise and useful
- **0**: No annotations where needed, or annotations are unhelpful

### Total score interpretation
- **9–10**: Excellent — ready to use
- **7–8**: Good — minor improvements recommended
- **5–6**: Acceptable — review and refine before use
- **0–4**: Poor — regenerate or significantly revise

## Acceptance threshold

A diagram is accepted for production use when:
- All automated validation checks pass (no errors)
- Human evaluation score ≥ 7 out of 10
- No structural errors (self-loops, invalid references)
- The diagram renders successfully in draw.io without import errors
