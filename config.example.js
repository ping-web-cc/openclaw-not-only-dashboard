// Copy this file to public/config.js and customize.
// public/config.js is gitignored and never committed.
// 複製此檔案為 public/config.js 並依需求修改。
// public/config.js 已加入 .gitignore，不會被提交。
//
// Agent colors are auto-generated from agent IDs — no config needed.
// Agent 顏色從 ID 自動產生，無需設定。
// Only define pipelines here (multi-agent workflows not in OpenClaw core).
// 此處只需定義 pipeline（多 agent 工作流程，非 OpenClaw 核心功能）。

window.PIT_STOP_CONFIG = {

  // ── Pipeline definitions / Pipeline 定義 ──────────────────────
  // Group your cron jobs into visual pipeline stages.
  // 將 cron jobs 分組為視覺化 pipeline 階段。
  pipelines: [
    // {
    //   id: 'my-pipeline',
    //   name: 'My Pipeline',          // display name shown in UI / 顯示在 UI 的名稱
    //   steps: [
    //     // label: step name shown in UI / 步驟顯示名稱
    //     // agent: OpenClaw agent ID / OpenClaw agent ID
    //     // time:  scheduled time (display only) / 排程時間（僅顯示用）
    //     // jobMatch: regex to match the cron job / 用來比對 cron job 的正規表達式
    //     { label: 'Evaluate',  agent: 'your-agent-id', time: '10:00', jobMatch: 'evaluate' },
    //     { label: 'Develop',   agent: 'your-agent-id', time: '10:05', jobMatch: 'develop'  },
    //     { label: 'Test',      agent: 'your-agent-id', time: '10:30', jobMatch: 'test'     },
    //     { label: 'Deploy',    agent: 'your-agent-id', time: '11:00', jobMatch: 'deploy'   },
    //   ]
    // }
  ],
}
