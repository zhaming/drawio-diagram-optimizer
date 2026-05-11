# drawio-diagram-optimizer release checklist

用于在发布 `drawio-diagram-optimizer` 前执行最终检查。

## 1. Scope and positioning

- [ ] 已明确该 skill 的定位是"diagram JSON 生成与 draw.io 渲染优化"
- [ ] 已明确非目标范围（如高保真 UI、严格 BPMN、复杂自由拓扑）
- [ ] 已明确默认输出优先级：JSON > validation > draw.io XML
- [ ] 已明确复杂场景下允许拆图而非强行单图输出

---

## 2. Documentation completeness

- [ ] `README.md` 已存在并可独立说明 skill 目标与边界
- [ ] `prompt.md` 已存在并描述稳定的 system prompt
- [ ] `schema.json` 已存在且字段定义可用
- [ ] `evaluator.md` 已存在并定义验收标准
- [ ] `mapping-spec.md` 已存在并定义 JSON → draw.io XML 规则
- [ ] `README-root-snippet.md` 已存在并可供根 README 引用
- [ ] `repository-file-manifest.md` 已存在并说明文件结构
- [ ] 文档中的字段命名与代码实现一致

---

## 3. Schema and contract checks

- [ ] 输入 schema 可用于校验请求
- [ ] 输出结构字段稳定
- [ ] `groups` / `nodes` / `edges` / `annotations` 定义清晰
- [ ] `styleRole` 枚举已固定
- [ ] `layoutDirection` 枚举已固定
- [ ] 边类型枚举已固定
- [ ] 没有依赖未定义的自由字段

---

## 4. Prompt quality checks

- [ ] prompt 中明确要求先分组后布局
- [ ] prompt 中明确要求使用 `shortLabel`
- [ ] prompt 中明确要求复杂场景建议拆图
- [ ] prompt 中明确要求 validation / 自检
- [ ] prompt 中未要求默认直接输出 draw.io XML
- [ ] prompt 中未引导模型生成任意自定义 style 字符串

---

## 5. Renderer implementation checks

- [ ] `drawio-renderer.ts` 可以成功编译
- [ ] renderer 能生成合法的 draw.io XML 骨架
- [ ] renderer 使用 `shortLabel` 作为节点文本
- [ ] renderer 对 group / node / edge / annotation 都有稳定映射
- [ ] renderer 对 XML 特殊字符执行了转义
- [ ] renderer 在错误输入下会抛出明确错误
- [ ] renderer 不依赖 LLM 直接提供绝对坐标
- [ ] renderer 的样式映射由固定函数管理

---

## 6. CLI checks

- [ ] `cli.ts` 可以成功编译
- [ ] CLI 支持从文件读取输入
- [ ] CLI 支持从 stdin 读取输入
- [ ] CLI 支持输出到 stdout
- [ ] CLI 支持 `--output`
- [ ] CLI 的错误提示清晰
- [ ] CLI 明确拒绝 skill request payload 直接作为 renderer 输入

---

## 7. Test checks

- [ ] `drawio-renderer.test.ts` 可以通过
- [ ] 测试覆盖基本 XML 生成
- [ ] 测试覆盖 group / node / edge / annotation 渲染
- [ ] 测试覆盖 `shortLabel` 使用
- [ ] 测试覆盖 XML 转义
- [ ] 测试覆盖重复 id 错误
- [ ] 测试覆盖非法 group 引用
- [ ] 测试覆盖非法 node 引用
- [ ] 测试覆盖 annotation 非法 target

---

## 8. Example checks

- [ ] `examples/example-input.json` 存在
- [ ] `examples/example-output.json` 存在
- [ ] 示例内容与 README 中的示例一致
- [ ] `example-output.json` 可被 renderer/CLI 正常消费
- [ ] 已成功生成至少一个 `.drawio.xml` 文件用于人工检查

---

## 9. Quality checks on actual output

至少选取若干真实场景进行抽查。

### Readability
- [ ] 节点文字未明显出界
- [ ] 节点文案足够短
- [ ] decision 节点文案已进一步压缩
- [ ] annotation 用于承载细节说明

### Layout
- [ ] group 边界清晰
- [ ] 主流程清楚
- [ ] 没有明显大面积重叠
- [ ] 连线总体可读
- [ ] 高复杂输入时有拆图建议

### Consistency
- [ ] 同类节点尺寸大体一致
- [ ] 色彩数量受控
- [ ] 样式角色统一
- [ ] 输出字段稳定

---

## 10. Build and run checks

在发布前至少执行以下命令并确认通过：

```bash
npm install
npm run build
npm test
npm run render:example
```

检查项：

- [ ] `npm install` 成功
- [ ] `npm run build` 成功
- [ ] `npm test` 成功
- [ ] `npm run render:example` 成功
- [ ] 成功产出 `examples/example-output.drawio.xml`

---

## 11. Versioning checks

- [ ] `package.json` 版本号正确
- [ ] README 中版本号与 package.json 一致
- [ ] 当前版本状态已明确（例如 `draft` / `beta` / `stable`）
- [ ] 若修改 schema 或 prompt，已记录版本变更说明

---

## 12. Release decision

### Ready to release when
- [ ] 文档完整
- [ ] schema 稳定
- [ ] renderer 和 CLI 可运行
- [ ] tests 全绿
- [ ] 至少有一个真实示例人工验收通过

### Do not release when
- [ ] prompt 仍频繁变动
- [ ] schema 仍不稳定
- [ ] renderer 无法稳定生成 XML
- [ ] 复杂图场景下没有降级或拆图策略
- [ ] 测试样例过少

---

## 13. Suggested release note template

发布时可参考：

```text
Release: drawio-diagram-optimizer v0.1.0

Highlights:
- Added structured diagram JSON skill definition
- Added prompt, schema, evaluator, and mapping specification
- Added TypeScript renderer for JSON → draw.io XML
- Added CLI for file/stdin-based conversion
- Added test coverage for XML generation and validation failures

Known limitations:
- Layout engine is heuristic-based and not yet graph-optimal
- Nested group layout is limited
- No advanced edge routing customization yet

Recommended usage:
- Use the skill to generate diagram JSON first
- Validate result quality
- Render to draw.io XML with the provided CLI or renderer
```

## 14. Final sign-off

- [ ] Product / capability owner sign-off
- [ ] Engineering sign-off
- [ ] Example output visual inspection completed
- [ ] Release notes prepared
- [ ] Repository content frozen for release
