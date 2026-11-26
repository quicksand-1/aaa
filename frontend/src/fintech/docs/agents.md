---
title: AI
---

项目公共的 AI 助手配置文档，主要给 ai 模型默认使用的上下文内容，用于规范 ai 模型的行为。

## 目录结构

<Tree>
  <ul>
    <li>
      <a href="/agents/AGENTS.md" target="_blank">AGENTS.md</a><small>项目主要的 AI 助手配置文档</small>
    </li>
    <li>
      skills/
      <ul>
        <li>
          f-drawer-form/<small>抽屉式表单组件技能</small>
          <ul>
            <li><a href="/agents/skills/f-drawer-form/SKILL.md" target="_blank">SKILL.md</a></li>
          </ul>
        </li>
        <li>
          f-form-schema/<small>JSON Schema表单组件技能</small>
          <ul>
            <li><a href="/agents/skills/f-form-schema/SKILL.md" target="_blank">SKILL.md</a></li>
          </ul>
        </li>
        <li>
          f-chat-layout/<small>聊天面板布局技能</small>
          <ul>
            <li><a href="/agents/skills/f-chat-layout/SKILL.md" target="_blank">SKILL.md</a></li>
          </ul>
        </li>
        <li>
          ui-ux-pro-max/<small>UI/UX 设计组件技能</small>
          <ul>
            <li><a href="/agents/skills/ui-ux-pro-max/SKILL.md" target="_blank">SKILL.md</a></li>
          </ul>
        </li>
        <li>
          grill-me/<small>询问共识技能</small>
          <ul>
            <li><a href="/agents/skills/grill-me/SKILL.md" target="_blank">SKILL.md</a></li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
</Tree>

## Agent 配置结构

| 平台       | AGENTS.md   | skills           |
| :--------- | :---------- | :--------------- |
| trae       | ./AGENTS.md | .trae/skills     |
| opencode   | ./AGENTS.md | .opencode/skills |
| claudecode | ./CLAUDE.md | .claude/skills   |
| copilot    | ./AGENTS.md | .github/skills   |
| cursor     | ./AGENTS.md | .cursor/skills   |
| codex      | ./AGENTS.md | .codex/skills    |
| qoder      | ./AGENTS.md | .qoder/skills    |

## ui-ux-pro-max 主题选项

### 通用风格

| #   | 主题                     | 描述                                |
| :-- | :----------------------- | :---------------------------------- |
| 1   | Minimalism & Swiss Style | 简洁、白底、网格布局、无装饰        |
| 2   | Neumorphism              | 软 UI、浮雕/凹陷效果、柔和阴影      |
| 3   | Glassmorphism            | 毛玻璃、背景模糊、透明叠加          |
| 4   | Brutalism                | 原始、未抛光、高对比、锐利边角      |
| 5   | 3D & Hyperrealism        | Three.js、真实纹理、沉浸式          |
| 6   | Vibrant & Block-based    | 大胆、有冲击力、色块布局            |
| 7   | Dark Mode (OLED)         | 纯黑背景、霓虹强调色、护眼          |
| 8   | Accessible & Ethical     | WCAG AAA、键盘导航、高对比          |
| 9   | Claymorphism             | 柔软 3D、厚边框、双阴影、有趣       |
| 10  | Aurora UI                | 极光渐变、流畅色彩混合、大气感      |
| 11  | Retro-Futurism           | 赛博朋克、霓虹、扫描线、80 年代美学 |
| 12  | Flat Design              | 2D、无阴影、纯色、简洁              |
| 13  | Skeuomorphism            | 拟物、真实纹理、复杂阴影            |
| 14  | Liquid Glass             | 流动玻璃、变形、色差效果            |
| 15  | Motion-Driven            | 动画为主、滚动触发、视差            |
| 16  | Micro-interactions       | 微交互、50-100ms 反馈、手势         |
| 17  | Inclusive Design         | 通用无障碍设计                      |
| 18  | Zero Interface           | 语音优先、极简可见 UI、AI 驱动      |
| 19  | Soft UI Evolution        | 改进的 Neumorphism、现代美学        |

### 着陆页风格

| #   | 主题                     | 描述                       |
| :-- | :----------------------- | :------------------------- |
| 20  | Hero-Centric Design      | 全屏 Hero、醒目 CTA        |
| 21  | Conversion-Optimized     | 表单焦点、信任徽章、紧迫感 |
| 22  | Feature-Rich Showcase    | 多特性网格展示             |
| 23  | Minimal & Direct         | 单栏、最大留白、仅必要内容 |
| 24  | Social Proof-Focused     | 客户评价、标志网格、案例   |
| 25  | Interactive Product Demo | 嵌入产品演示/视频          |
| 26  | Trust & Authority        | 证书、安全标识、专家背书   |
| 27  | Storytelling-Driven      | 叙事流程、章节式滚动       |

### BI/分析仪表盘风格

| #   | 主题                           | 描述                       |
| :-- | :----------------------------- | :------------------------- |
| 28  | Data-Dense Dashboard           | 多重图表、最小内边距       |
| 29  | Heat Map & Heatmap Style       | 颜色编码矩阵               |
| 30  | Executive Dashboard            | 高层 KPI、概况图           |
| 31  | Real-Time Monitoring           | 实时数据流、告警           |
| 32  | Drill-Down Analytics           | 层级下钻、面包屑导航       |
| 33  | Comparative Analysis Dashboard | 并排对比、环比             |
| 34  | Predictive Analytics           | 预测线、置信区间、异常检测 |
