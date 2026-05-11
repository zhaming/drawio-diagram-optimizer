import assert from "node:assert/strict";
import test from "node:test";
import { renderDrawio, type Diagram } from "./drawio-renderer.js";

function createExampleDiagram(): Diagram {
  return {
    title: "智能体任务执行流程",
    diagramType: "architecture",
    layoutDirection: "TB",
    groups: [
      {
        id: "g1",
        title: "输入层",
        parentId: null,
        level: 1,
        layoutHint: "vertical",
        styleRole: "container"
      },
      {
        id: "g2",
        title: "编排层",
        parentId: null,
        level: 1,
        layoutHint: "vertical",
        styleRole: "container"
      },
      {
        id: "g3",
        title: "执行层",
        parentId: null,
        level: 1,
        layoutHint: "vertical",
        styleRole: "container"
      }
    ],
    nodes: [
      {
        id: "n1",
        label: "用户提交任务请求",
        shortLabel: "用户请求",
        type: "start-end",
        groupId: "g1",
        level: 1,
        width: 160,
        height: 70,
        styleRole: "start-end",
        layoutHint: { order: 1 }
      },
      {
        id: "n2",
        label: "系统解析任务与上下文",
        shortLabel: "任务解析",
        type: "process",
        groupId: "g2",
        level: 1,
        width: 160,
        height: 70,
        styleRole: "primary-process",
        layoutHint: { order: 2 }
      },
      {
        id: "n3",
        label: "编排器决定调用哪个工具",
        shortLabel: "工具决策",
        type: "decision",
        groupId: "g2",
        level: 1,
        width: 160,
        height: 70,
        styleRole: "decision",
        layoutHint: { order: 3 }
      },
      {
        id: "n4",
        label: "工具层执行检索、计算或外部 API 调用",
        shortLabel: "工具执行",
        type: "process",
        groupId: "g3",
        level: 1,
        width: 160,
        height: 70,
        styleRole: "primary-process",
        layoutHint: { order: 4 }
      },
      {
        id: "n5",
        label: "结果汇总后交给大模型生成响应",
        shortLabel: "结果生成",
        type: "process",
        groupId: "g3",
        level: 1,
        width: 160,
        height: 70,
        styleRole: "primary-process",
        layoutHint: { order: 5 }
      },
      {
        id: "n6",
        label: "返回给用户",
        shortLabel: "返回响应",
        type: "start-end",
        groupId: "g3",
        level: 1,
        width: 160,
        height: 70,
        styleRole: "start-end",
        layoutHint: { order: 6 }
      }
    ],
    edges: [
      {
        id: "e1",
        source: "n1",
        target: "n2",
        label: "",
        type: "solid",
        priority: 1
      },
      {
        id: "e2",
        source: "n2",
        target: "n3",
        label: "",
        type: "solid",
        priority: 1
      },
      {
        id: "e3",
        source: "n3",
        target: "n4",
        label: "",
        type: "solid",
        priority: 1
      },
      {
        id: "e4",
        source: "n4",
        target: "n5",
        label: "",
        type: "solid",
        priority: 1
      },
      {
        id: "e5",
        source: "n5",
        target: "n6",
        label: "",
        type: "solid",
        priority: 1
      }
    ],
    annotations: [
      {
        id: "a1",
        targetId: "n4",
        text: "包括检索、计算和调用外部 API"
      }
    ]
  };
}

test("renderDrawio should generate a valid draw.io xml skeleton", () => {
  const diagram = createExampleDiagram();
  const xml = renderDrawio(diagram);

  assert.ok(xml.startsWith(`<mxfile host="app.diagrams.net">`));
  assert.ok(xml.includes(`<diagram name="智能体任务执行流程">`));
  assert.ok(xml.includes(`<mxGraphModel`));
  assert.ok(xml.includes(`<root>`));
  assert.ok(xml.includes(`<mxCell id="0"/>`));
  assert.ok(xml.includes(`<mxCell id="1" parent="0"/>`));
  assert.ok(xml.includes(`</mxfile>`));
});

test("renderDrawio should render groups, nodes, annotations, and edges", () => {
  const diagram = createExampleDiagram();
  const xml = renderDrawio(diagram);

  assert.ok(xml.includes(`id="g_g1"`));
  assert.ok(xml.includes(`id="g_g2"`));
  assert.ok(xml.includes(`id="g_g3"`));

  assert.ok(xml.includes(`id="n_n1"`));
  assert.ok(xml.includes(`id="n_n2"`));
  assert.ok(xml.includes(`id="n_n3"`));
  assert.ok(xml.includes(`id="n_n4"`));
  assert.ok(xml.includes(`id="n_n5"`));
  assert.ok(xml.includes(`id="n_n6"`));

  assert.ok(xml.includes(`id="a_a1"`));

  assert.ok(xml.includes(`id="e_e1"`));
  assert.ok(xml.includes(`id="e_e2"`));
  assert.ok(xml.includes(`id="e_e3"`));
  assert.ok(xml.includes(`id="e_e4"`));
  assert.ok(xml.includes(`id="e_e5"`));
});

test("renderDrawio should use shortLabel instead of label for node values", () => {
  const diagram = createExampleDiagram();
  const xml = renderDrawio(diagram);

  assert.ok(xml.includes(`value="用户请求"`));
  assert.ok(xml.includes(`value="任务解析"`));
  assert.ok(xml.includes(`value="工具决策"`));
  assert.ok(xml.includes(`value="工具执行"`));
  assert.ok(xml.includes(`value="结果生成"`));

  assert.equal(xml.includes(`value="系统解析任务与上下文"`), false);
  assert.equal(xml.includes(`value="工具层执行检索、计算或外部 API 调用"`), false);
});

test("renderDrawio should reference correct node ids in edges", () => {
  const diagram = createExampleDiagram();
  const xml = renderDrawio(diagram);

  assert.ok(xml.includes(`source="n_n1" target="n_n2"`));
  assert.ok(xml.includes(`source="n_n2" target="n_n3"`));
  assert.ok(xml.includes(`source="n_n3" target="n_n4"`));
  assert.ok(xml.includes(`source="n_n4" target="n_n5"`));
  assert.ok(xml.includes(`source="n_n5" target="n_n6"`));
});

test("renderDrawio should escape xml special characters", () => {
  const diagram = createExampleDiagram();
  diagram.title = `A&B <Flow> "Demo"`;
  diagram.nodes[0]!.shortLabel = `A&B <Node> "Start"`;
  diagram.annotations[0]!.text = `Use <API> & "Tool"`;

  const xml = renderDrawio(diagram);

  assert.ok(xml.includes(`<diagram name="A&amp;B &lt;Flow&gt; &quot;Demo&quot;">`));
  assert.ok(xml.includes(`value="A&amp;B &lt;Node&gt; &quot;Start&quot;"`));
  assert.ok(xml.includes(`value="Use &lt;API&gt; &amp; &quot;Tool&quot;"`));
});

test("renderDrawio should throw on duplicate group ids", () => {
  const diagram = createExampleDiagram();
  diagram.groups.push({
    id: "g1",
    title: "重复组",
    parentId: null,
    level: 1,
    layoutHint: "vertical",
    styleRole: "container"
  });

  assert.throws(() => renderDrawio(diagram), /Duplicate group id: g1/);
});

test("renderDrawio should throw on duplicate node ids", () => {
  const diagram = createExampleDiagram();
  diagram.nodes.push({
    id: "n1",
    label: "重复节点",
    shortLabel: "重复节点",
    type: "process",
    groupId: "g1",
    level: 1,
    width: 160,
    height: 70,
    styleRole: "primary-process"
  });

  assert.throws(() => renderDrawio(diagram), /Duplicate node id: n1/);
});

test("renderDrawio should throw when node references missing group", () => {
  const diagram = createExampleDiagram();
  diagram.nodes[0]!.groupId = "missing-group";

  assert.throws(() => renderDrawio(diagram), /references missing groupId missing-group/);
});

test("renderDrawio should throw when edge references missing node", () => {
  const diagram = createExampleDiagram();
  diagram.edges[0]!.source = "missing-node";

  assert.throws(() => renderDrawio(diagram), /source not found: missing-node/);
});

test("renderDrawio should throw when annotation target node is missing", () => {
  const diagram = createExampleDiagram();
  diagram.annotations[0]!.targetId = "missing-node";

  assert.throws(() => renderDrawio(diagram), /target node not found: missing-node/);
});
