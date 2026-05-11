# drawio-diagram-optimizer usage snippet

以下内容可合并到仓库根 README，帮助其他人快速理解如何构建、测试和运行该 skill 的渲染链路。

## Directory

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
    ├── example-input.json
    └── example-output.json
```

## What this package does

该目录包含一套围绕 `drawio-diagram-optimizer` 的最小可运行工具链：

- skill 说明文档
- 输入 schema
- prompt 与 evaluator
- 示例输入输出
- JSON → draw.io XML 映射规范
- TypeScript 渲染器
- CLI
- 单元测试

## Install

进入目录后安装依赖：

```bash
cd skills/drawio-diagram-optimizer
npm install
```

## Build

编译 TypeScript：

```bash
npm run build
```

编译后输出到：

```text
skills/drawio-diagram-optimizer/dist/
```

## Run tests

执行测试：

```bash
npm test
```

当前测试会：

- 校验 XML 基本骨架是否生成
- 校验 group / node / edge / annotation 是否渲染
- 校验节点使用 `shortLabel`
- 校验 XML 特殊字符转义
- 校验错误场景是否正确抛错

## Render example

将示例结果 JSON 渲染为 draw.io XML：

```bash
npm run render:example
```

执行后将生成：

```text
skills/drawio-diagram-optimizer/examples/example-output.drawio.xml
```

然后你可以在 draw.io / diagrams.net 中导入该 XML 文件。

## CLI usage

### Render from file

```bash
npm run build
node dist/cli.js ./examples/example-output.json > ./examples/example-output.drawio.xml
```

### Render to a specific output file

```bash
npm run build
node dist/cli.js ./examples/example-output.json --output ./examples/example-output.drawio.xml
```

### Render from stdin

```bash
cat ./examples/example-output.json | node dist/cli.js > ./examples/example-output.drawio.xml
```

## Important input note

CLI 接收的是**diagram result JSON**，即包含以下字段的结构：

- `title`
- `diagramType`
- `layoutDirection`
- `groups`
- `nodes`
- `edges`
- `annotations`

CLI **不直接接收** skill 请求体，即这种结构不能直接传给 CLI：

```json
{
  "task": "generate_or_optimize_drawio_diagram",
  "input": {
    "description": "..."
  }
}
```

如果你拿到的是 skill 请求，需要先经过 skill 执行，生成 diagram result JSON，再交给 CLI。

## Suggested workflow

推荐接入流程如下：

1. 用户输入自然语言描述
2. `drawio-diagram-optimizer` skill 输出 diagram JSON
3. 使用 schema / evaluator 校验结构和质量
4. 用 `drawio-renderer.ts` 转成 draw.io XML
5. 在 draw.io 中打开或继续二次编辑

## Recommended next steps

如果你要把它进一步产品化，建议继续补充：

- CI 校验脚本
- JSON Schema 校验器
- 更复杂的自动布局引擎
- 多主题样式支持
- draw.io XML pretty-print 或导出压缩选项
