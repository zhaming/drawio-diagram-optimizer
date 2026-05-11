# drawio-diagram-optimizer repository file manifest

本文档列出当前建议落库的完整目录结构与文件用途，便于一次性创建仓库内容。

## Recommended directory tree

```text
skills/drawio-diagram-optimizer/
├── README.md
├── README-root-snippet.md
├── schema.json
├── prompt.md
├── evaluator.md
├── mapping-spec.md
├── repository-file-manifest.md
├── release-checklist.md
├── drawio-renderer.ts
├── drawio-renderer.test.ts
├── cli.ts
├── package.json
├── tsconfig.json
└── examples/
    ├── example-input.json
    └── example-output.json
```

## File-by-file purpose

### `README.md`
主说明文档，定义：

- skill 目标
- 输入输出契约
- 非目标范围
- 核心原则
- system prompt
- example input/output
- 验收清单

### `README-root-snippet.md`
给仓库根 README 使用的摘录内容，方便他人快速上手：

- 安装
- 构建
- 测试
- 运行 CLI
- 使用建议

### `schema.json`
定义 skill 请求的输入 schema，以及结果对象的结构参考。

适合用于：
- 请求校验
- 平台接入
- 自动化测试
- IDE 提示

### `prompt.md`
保存 skill 的系统提示词或能力提示模板。

适合用于：
- agent skill 配置
- 平台 prompt 注入
- prompt 版本管理

### `evaluator.md`
定义质量评估标准与自动验收规则。

适合用于：
- 人工评审
- 自动评分
- regression test 标准

### `mapping-spec.md`
定义 diagram JSON 如何映射为 draw.io XML。

适合用于：
- 渲染器实现规范
- 多实现之间对齐
- 后续 renderer 重构

### `repository-file-manifest.md`
当前这份文件。用于说明有哪些文件、为什么存在、应如何组织。

### `release-checklist.md`
发布前检查单。

适合用于：
- 内部提测
- 版本冻结前检查
- 发布审批

### `drawio-renderer.ts`
最小可运行的 JSON → draw.io XML 转换器实现。

职责：
- 校验基本引用关系
- 执行简单布局
- 生成 mxGraphModel XML
- 映射节点/容器/边样式

### `drawio-renderer.test.ts`
渲染器测试文件。

覆盖内容：
- 基础 XML 生成
- id 与引用关系
- shortLabel 使用
- XML 特殊字符转义
- 错误输入场景

### `cli.ts`
命令行入口。

支持：
- 从 JSON 文件读取
- 从 stdin 读取
- 输出到 stdout
- 输出到指定文件

### `package.json`
Node/TypeScript 包配置，包含：

- build
- clean
- test
- render:example

### `tsconfig.json`
TypeScript 编译配置。

### `examples/example-input.json`
skill 请求输入示例。

说明：
- 这是"给 skill 的请求"
- 不是直接给 renderer 的输入

### `examples/example-output.json`
skill 执行后的 diagram 结果示例。

说明：
- 这是 renderer / CLI 的直接输入

## Recommended usage flow

推荐文件之间的调用顺序：

```text
example-input.json
  ↓
skill / prompt.md / schema.json
  ↓
example-output.json
  ↓
drawio-renderer.ts / cli.ts
  ↓
draw.io XML
```

## Suggested future additions

如果后续继续扩展，可考虑增加以下文件：

```text
skills/drawio-diagram-optimizer/
├── theme-default.json
├── theme-dark.json
├── layout-engine.ts
├── schema.result.json
├── validate-result.ts
├── fixtures/
│   ├── complex-architecture.json
│   ├── long-text-case.json
│   └── split-diagram-case.json
└── docs/
    ├── design-decisions.md
    └── faq.md
```

## Minimal publish set

如果你暂时不想一次性放太多文件，最小发布集建议是：

```text
skills/drawio-diagram-optimizer/
├── README.md
├── schema.json
├── prompt.md
├── evaluator.md
├── mapping-spec.md
├── drawio-renderer.ts
├── drawio-renderer.test.ts
├── cli.ts
├── package.json
├── tsconfig.json
└── examples/
    └── example-output.json
```

## Full recommended set

建议完整保留所有当前文件，因为：

- 文档完整
- 工程路径清晰
- 后续维护成本更低
- 对接、评审、发布都更方便
