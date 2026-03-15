# OpenClaw Pit Stop 🏎️

> **Agent Fitting Room for OpenClaw** | OpenClaw Agent 試衣間

[English](#english) | [中文](#中文)

---

## English

A local dashboard for [OpenClaw](https://github.com/openclaw/openclaw) that lets you chat with agents, edit their soul files, manage cron jobs, and monitor pipelines — all in one neon-lit interface.

### Features

- **3D Stage** — each agent gets a procedurally-generated 3D character with unique color
- **Voice Chat** — text or voice input; agent replies read aloud via Browser TTS or OpenAI TTS
- **Soul Editor** — edit `soul.md`, `identity.md`, `user.md`, `CLAUDE.md` in-browser
- **Cron Manager** — view, toggle, and edit scheduled jobs with live status badges
- **Pipeline Monitor** — visualize multi-agent workflows defined in `config.js`
- **i18n** — toggle between 繁體中文 and English with the `[EN]` button
- **Collapsible Sidebars** — collapse and drag-resize both side panels

### Requirements

- [OpenClaw](https://github.com/openclaw/openclaw) running (default `http://localhost:18789`)
- Node.js 18+
- OpenAI API key (optional, only for OpenAI TTS)

### Setup

```bash
git clone https://github.com/shyuping/openclaw-not-only-dashboard.git
cd openclaw-not-only-dashboard
npm install

cp .env.example .env
# Edit .env — set OPENAI_API_KEY if you want OpenAI TTS

node server.js
# Open http://localhost:18790
```

### Pipeline Config (optional)

Copy `config.example.js` to `public/config.js` and define your pipelines:

```js
window.PIT_STOP_CONFIG = {
  pipelines: [
    {
      id: 'dev-loop',
      name: 'Dev Loop',
      steps: [
        { label: 'Evaluate', agent: 'evaluator',  time: '10:00', jobMatch: 'evaluate' },
        { label: 'Develop',  agent: 'developer',  time: '10:05', jobMatch: 'develop'  },
        { label: 'Test',     agent: 'tester',     time: '10:30', jobMatch: 'test'     },
      ]
    }
  ]
}
```

`public/config.js` is gitignored — safe to put your agent IDs there.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `18790` | HTTP port |
| `OPENCLAW_GATEWAY` | `http://localhost:18789` | OpenClaw gateway URL |
| `OPENAI_API_KEY` | — | Required only for OpenAI TTS |

### Screenshots

<!-- screenshot: main view -->

---

## 中文

一個本地端 Dashboard，連接你的 [OpenClaw](https://github.com/openclaw/openclaw) 服務，讓你直接在瀏覽器裡跟 agent 聊天、編輯靈魂文件、管理 cron 排程、監控 pipeline。

### 功能亮點

- **3D 舞台** — 每個 agent 自動產生對應顏色的 3D 角色
- **語音對話** — 支援文字輸入、語音輸入；agent 回覆可自動朗讀（瀏覽器 TTS 或 OpenAI TTS）
- **靈魂編輯器** — 直接在瀏覽器編輯 `soul.md`、`identity.md`、`user.md`、`CLAUDE.md`
- **排程管理** — 查看、啟停、編輯 cron jobs，即時顯示執行狀態
- **Pipeline 監控** — 視覺化多 agent 工作流程（由 `config.js` 定義）
- **中英切換** — 點右上角 `[EN]` 按鈕即時切換介面語言
- **側欄摺疊/拖移** — 兩側面板可摺疊、拖移調整寬度

### 系統需求

- [OpenClaw](https://github.com/openclaw/openclaw) 運行中（預設 `http://localhost:18789`）
- Node.js 18+
- OpenAI API Key（可選，僅 OpenAI TTS 需要）

### 安裝步驟

```bash
git clone https://github.com/shyuping/openclaw-not-only-dashboard.git
cd openclaw-not-only-dashboard
npm install

cp .env.example .env
# 編輯 .env，若要使用 OpenAI TTS 請填入 OPENAI_API_KEY

node server.js
# 開啟 http://localhost:18790
```

### Pipeline 設定（可選）

複製 `config.example.js` 為 `public/config.js`，定義你的 pipeline：

```js
window.PIT_STOP_CONFIG = {
  pipelines: [
    {
      id: 'ping-web',
      name: 'Ping Web Pipeline',
      steps: [
        { label: '評估員', agent: 'kaijin',   time: '10:00', jobMatch: '評估' },
        { label: '開發員', agent: 'diablo',   time: '10:05', jobMatch: '開發' },
        { label: '測試員', agent: 'ramiris',  time: '10:30', jobMatch: '測試' },
      ]
    }
  ]
}
```

`public/config.js` 已加入 `.gitignore`，可放心填入 agent ID。

### 環境變數

| 變數 | 預設值 | 說明 |
|---|---|---|
| `PORT` | `18790` | HTTP 埠號 |
| `OPENCLAW_GATEWAY` | `http://localhost:18789` | OpenClaw gateway 位址 |
| `OPENAI_API_KEY` | — | 僅 OpenAI TTS 需要 |

### 截圖

<!-- screenshot: main view -->

---

## License

MIT
