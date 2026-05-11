# drawio-diagram-optimizer mapping specification

This document defines how the diagram JSON produced by the skill maps to draw.io XML (`mxGraphModel` format).

## XML document structure

```xml
<mxfile host="app.diagrams.net">
  <diagram name="{title}">
    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" ...>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- groups, nodes, annotations, edges rendered here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

All string attribute values must have XML special characters escaped:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&apos;`

## ID mapping

| JSON field | draw.io cell ID |
|------------|-----------------|
| `groups[].id` | `g_{id}` |
| `nodes[].id` | `n_{id}` |
| `edges[].id` | `e_{id}` |
| `annotations[].id` | `a_{id}` |

## Group mapping

Each group maps to a swimlane `mxCell`:

```xml
<mxCell
  id="g_{group.id}"
  value="{group.title}"
  style="swimlane;startSize=30;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;"
  vertex="1"
  parent="1"
>
  <mxGeometry x="{x}" y="{y}" width="{width}" height="{height}" as="geometry"/>
</mxCell>
```

Groups are placed horizontally (left to right) with a gap of 30px between them.
Group width is computed from the widest node plus horizontal padding (20px each side).
Group height is computed from the sum of node heights plus vertical padding.

## Node mapping

Each node maps to a vertex `mxCell`, parented to its group:

```xml
<mxCell
  id="n_{node.id}"
  value="{node.shortLabel}"
  style="{mapped style}"
  vertex="1"
  parent="g_{node.groupId}"
>
  <mxGeometry x="{x}" y="{y}" width="{node.width}" height="{node.height}" as="geometry"/>
</mxCell>
```

**Important**: The `value` attribute uses `shortLabel`, not `label`.

### Node style mapping

| `styleRole` | draw.io style |
|-------------|---------------|
| `start-end` | `rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;` |
| `primary-process` | `rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;` |
| `secondary-process` | `rounded=0;whiteSpace=wrap;html=1;` |
| `decision` | `rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;` |
| `data` | `shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;` |

### Node positioning within group

Nodes are stacked vertically within their group:
- First node Y: `GROUP_HEADER_HEIGHT (30) + GROUP_PADDING (20)` = 50px from top of group
- Subsequent nodes: previous node Y + previous node height + `NODE_GAP (20)`
- Node X: `GROUP_HORIZONTAL_PADDING (20)` from left edge of group

## Edge mapping

Each edge maps to an edge `mxCell`, parented to root cell `1`:

```xml
<mxCell
  id="e_{edge.id}"
  value="{edge.label}"
  style="{mapped style}"
  edge="1"
  source="n_{edge.source}"
  target="n_{edge.target}"
  parent="1"
>
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### Edge style mapping

| `type` | draw.io style |
|--------|---------------|
| `solid` | `edgeStyle=orthogonalEdgeStyle;` |
| `dashed` | `edgeStyle=orthogonalEdgeStyle;dashed=1;` |
| `dotted` | `edgeStyle=orthogonalEdgeStyle;dashed=1;dashPattern=1 4;` |

## Annotation mapping

Each annotation maps to a text `mxCell` positioned near its target node, parented to root cell `1`:

```xml
<mxCell
  id="a_{annotation.id}"
  value="{annotation.text}"
  style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;"
  vertex="1"
  parent="1"
>
  <mxGeometry x="{x}" y="{y}" width="160" height="60" as="geometry"/>
</mxCell>
```

Annotation position:
- X: group X + node X within group + node width + 10px (placed to the right of the node)
- Y: group Y + node Y within group

## Layout constants

| Constant | Value | Description |
|----------|-------|-------------|
| `GROUP_PADDING` | 20px | Padding inside group above/below nodes |
| `NODE_GAP` | 20px | Vertical gap between nodes within a group |
| `GROUP_HEADER_HEIGHT` | 30px | Height of group swimlane header |
| `GROUP_HORIZONTAL_PADDING` | 20px | Padding on each side of nodes within group |
| `GROUP_GAP` | 30px | Horizontal gap between groups |

## Validation before rendering

The renderer validates all references before generating XML:

1. Duplicate group IDs → throw `Duplicate group id: {id}`
2. Duplicate node IDs → throw `Duplicate node id: {id}`
3. Node references missing group → throw `Node {id} references missing groupId {groupId}`
4. Edge source not found → throw `Edge {id}: source not found: {nodeId}`
5. Edge target not found → throw `Edge {id}: target not found: {nodeId}`
6. Annotation target not found → throw `Annotation {id}: target node not found: {nodeId}`
