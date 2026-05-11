export interface Group {
  id: string;
  title: string;
  parentId: string | null;
  level: number;
  layoutHint: string;
  styleRole: string;
}

export interface NodeLayoutHint {
  order: number;
}

export interface Node {
  id: string;
  label: string;
  shortLabel: string;
  type: string;
  groupId: string;
  level: number;
  width: number;
  height: number;
  styleRole: string;
  layoutHint?: NodeLayoutHint;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  priority: number;
}

export interface Annotation {
  id: string;
  targetId: string;
  text: string;
}

export interface Diagram {
  title: string;
  diagramType: string;
  layoutDirection: string;
  groups: Group[];
  nodes: Node[];
  edges: Edge[];
  annotations: Annotation[];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const GROUP_PADDING = 20;
const NODE_GAP = 20;
const GROUP_HEADER_HEIGHT = 30;
const GROUP_HORIZONTAL_PADDING = 20;
const GROUP_GAP = 30;

function getNodeStyle(styleRole: string): string {
  switch (styleRole) {
    case "start-end":
      return "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;";
    case "decision":
      return "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;";
    case "primary-process":
      return "rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;";
    case "container":
      return "swimlane;startSize=30;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;";
    default:
      return "rounded=0;whiteSpace=wrap;html=1;";
  }
}

function getGroupStyle(_styleRole: string): string {
  return "swimlane;startSize=30;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;";
}

function getEdgeStyle(type: string): string {
  if (type === "dashed") {
    return "edgeStyle=orthogonalEdgeStyle;dashed=1;";
  }
  return "edgeStyle=orthogonalEdgeStyle;";
}

export function renderDrawio(diagram: Diagram): string {
  // Validate: no duplicate group ids
  const groupIdSet = new Set<string>();
  for (const group of diagram.groups) {
    if (groupIdSet.has(group.id)) {
      throw new Error(`Duplicate group id: ${group.id}`);
    }
    groupIdSet.add(group.id);
  }

  // Validate: no duplicate node ids
  const nodeIdSet = new Set<string>();
  for (const node of diagram.nodes) {
    if (nodeIdSet.has(node.id)) {
      throw new Error(`Duplicate node id: ${node.id}`);
    }
    nodeIdSet.add(node.id);
  }

  // Validate: nodes reference valid groups
  for (const node of diagram.nodes) {
    if (!groupIdSet.has(node.groupId)) {
      throw new Error(`Node ${node.id} references missing groupId ${node.groupId}`);
    }
  }

  // Validate: edges reference valid nodes
  for (const edge of diagram.edges) {
    if (!nodeIdSet.has(edge.source)) {
      throw new Error(`Edge ${edge.id}: source not found: ${edge.source}`);
    }
    if (!nodeIdSet.has(edge.target)) {
      throw new Error(`Edge ${edge.id}: target not found: ${edge.target}`);
    }
  }

  // Validate: annotations reference valid nodes
  for (const annotation of diagram.annotations) {
    if (!nodeIdSet.has(annotation.targetId)) {
      throw new Error(`Annotation ${annotation.id}: target node not found: ${annotation.targetId}`);
    }
  }

  // Layout: compute positions for groups and nodes
  // Group nodes by their groupId
  const nodesByGroup = new Map<string, Node[]>();
  for (const group of diagram.groups) {
    nodesByGroup.set(group.id, []);
  }
  for (const node of diagram.nodes) {
    nodesByGroup.get(node.groupId)!.push(node);
  }

  // Sort nodes within each group by layoutHint.order if available
  for (const nodes of nodesByGroup.values()) {
    nodes.sort((a, b) => {
      const orderA = a.layoutHint?.order ?? Infinity;
      const orderB = b.layoutHint?.order ?? Infinity;
      return orderA - orderB;
    });
  }

  // Compute group sizes and positions
  const groupPositions = new Map<string, { x: number; y: number; width: number; height: number }>();
  const nodePositions = new Map<string, { x: number; y: number }>();

  let groupX = GROUP_GAP;

  for (const group of diagram.groups) {
    const nodes = nodesByGroup.get(group.id) ?? [];

    // Compute group content size
    let contentWidth = 0;
    let contentHeight = GROUP_HEADER_HEIGHT;

    let nodeY = GROUP_HEADER_HEIGHT + GROUP_PADDING;
    for (const node of nodes) {
      if (node.width > contentWidth) {
        contentWidth = node.width;
      }
      nodePositions.set(node.id, { x: GROUP_HORIZONTAL_PADDING, y: nodeY });
      nodeY += node.height + NODE_GAP;
    }
    contentHeight = nodeY + GROUP_PADDING;
    contentWidth += GROUP_HORIZONTAL_PADDING * 2;

    if (contentWidth < 100) {
      contentWidth = 100;
    }

    groupPositions.set(group.id, { x: groupX, y: GROUP_GAP, width: contentWidth, height: contentHeight });
    groupX += contentWidth + GROUP_GAP;
  }

  // Annotation positions: place near target node, offset below
  const annotationPositions = new Map<string, { x: number; y: number; width: number; height: number }>();
  for (const annotation of diagram.annotations) {
    const targetNode = diagram.nodes.find((n) => n.id === annotation.targetId)!;
    const targetGroup = diagram.groups.find((g) => g.id === targetNode.groupId)!;
    const groupPos = groupPositions.get(targetGroup.id)!;
    const nodePos = nodePositions.get(targetNode.id)!;
    annotationPositions.set(annotation.id, {
      x: groupPos.x + nodePos.x + targetNode.width + 10,
      y: groupPos.y + nodePos.y,
      width: 160,
      height: 60
    });
  }

  // Build XML
  const lines: string[] = [];
  lines.push(`<mxfile host="app.diagrams.net">`);
  lines.push(`  <diagram name="${escapeXml(diagram.title)}">`);
  lines.push(`    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">`);
  lines.push(`      <root>`);
  lines.push(`        <mxCell id="0"/>`);
  lines.push(`        <mxCell id="1" parent="0"/>`);

  // Render groups
  for (const group of diagram.groups) {
    const pos = groupPositions.get(group.id)!;
    const style = getGroupStyle(group.styleRole);
    lines.push(
      `        <mxCell id="g_${group.id}" value="${escapeXml(group.title)}" style="${style}" vertex="1" parent="1">`
    );
    lines.push(
      `          <mxGeometry x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" as="geometry"/>`
    );
    lines.push(`        </mxCell>`);
  }

  // Render nodes
  for (const node of diagram.nodes) {
    const nodePos = nodePositions.get(node.id)!;
    const style = getNodeStyle(node.styleRole);
    const displayLabel = node.shortLabel || node.label;
    lines.push(
      `        <mxCell id="n_${node.id}" value="${escapeXml(displayLabel)}" style="${style}" vertex="1" parent="g_${node.groupId}">`
    );
    lines.push(
      `          <mxGeometry x="${nodePos.x}" y="${nodePos.y}" width="${node.width}" height="${node.height}" as="geometry"/>`
    );
    lines.push(`        </mxCell>`);
  }

  // Render annotations
  for (const annotation of diagram.annotations) {
    const pos = annotationPositions.get(annotation.id)!;
    lines.push(
      `        <mxCell id="a_${annotation.id}" value="${escapeXml(annotation.text)}" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;" vertex="1" parent="1">`
    );
    lines.push(
      `          <mxGeometry x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" as="geometry"/>`
    );
    lines.push(`        </mxCell>`);
  }

  // Render edges
  for (const edge of diagram.edges) {
    const style = getEdgeStyle(edge.type);
    lines.push(
      `        <mxCell id="e_${edge.id}" value="${escapeXml(edge.label)}" style="${style}" edge="1" source="n_${edge.source}" target="n_${edge.target}" parent="1">`
    );
    lines.push(`          <mxGeometry relative="1" as="geometry"/>`);
    lines.push(`        </mxCell>`);
  }

  lines.push(`      </root>`);
  lines.push(`    </mxGraphModel>`);
  lines.push(`  </diagram>`);
  lines.push(`</mxfile>`);

  return lines.join("\n");
}
