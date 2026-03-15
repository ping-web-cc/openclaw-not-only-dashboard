require('dotenv').config()
const express = require('express')
const fs = require('fs').promises
const path = require('path')
const os = require('os')

const app = express()
const PORT = process.env.PORT || 18790
const OC_DIR = path.join(os.homedir(), '.openclaw')
const DEMO_MODE = process.env.DEMO_MODE === 'true'

app.use(express.json({ limit: '10mb' }))
app.use(express.static(path.join(__dirname, 'public')))

// ─── Demo Mode Guard ────────────────────────────────────────────────────────
function demoGuard(req, res, next) {
  if (DEMO_MODE) return res.status(403).json({ error: 'Demo mode — read only' })
  next()
}

// ─── Safety ────────────────────────────────────────────────────────────────
function safePath(...parts) {
  const full = path.resolve(OC_DIR, ...parts)
  if (!full.startsWith(OC_DIR)) throw new Error('Path traversal denied')
  return full
}

function validId(id) {
  return /^[\w-]+$/.test(id)
}

// ─── Agents ────────────────────────────────────────────────────────────────
app.get('/api/config', async (req, res) => {
  try {
    const raw = await fs.readFile(safePath('openclaw.json'), 'utf8')
    const config = JSON.parse(raw)
    const agents = config.agents?.list || config.agents || []
    res.json({ agents })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Read workspace md files + agent config fields
app.get('/api/agent/:id', async (req, res) => {
  const { id } = req.params
  if (!validId(id)) return res.status(400).json({ error: 'Invalid agent id' })

  try {
    const raw = await fs.readFile(safePath('openclaw.json'), 'utf8')
    const config = JSON.parse(raw)
    const agentList = config.agents?.list || config.agents || []
    const agent = agentList.find(a => a.id === id)
    if (!agent) return res.status(404).json({ error: 'Agent not found' })

    // Resolve workspace dir — main has no workspace field, falls back to ~/.openclaw/workspace
    const wsDir = agent.workspace
      ? agent.workspace.replace('/home/node', os.homedir())
      : (id === 'main'
          ? path.join(OC_DIR, 'workspace')
          : path.join(OC_DIR, `workspace-${id}`))

    // Files use UPPERCASE names (SOUL.md, IDENTITY.md, USER.md)
    const files = {}
    for (const [key, fname] of [
      ['soul.md',     'SOUL.md'],
      ['identity.md', 'IDENTITY.md'],
      ['user.md',     'USER.md'],
      ['CLAUDE.md',   'CLAUDE.md'],
    ]) {
      try {
        files[key] = await fs.readFile(path.join(wsDir, fname), 'utf8')
      } catch {
        files[key] = null
      }
    }

    res.json({ agent, files })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Save workspace md file
app.put('/api/agent/:id/file', demoGuard, async (req, res) => {
  const { id } = req.params
  const { filename, content } = req.body
  if (!validId(id)) return res.status(400).json({ error: 'Invalid agent id' })
  if (!['soul.md', 'identity.md', 'user.md', 'CLAUDE.md'].includes(filename)) {
    return res.status(400).json({ error: 'Invalid filename' })
  }
  // Map logical name → actual uppercase filename
  const FNAME_MAP = { 'soul.md': 'SOUL.md', 'identity.md': 'IDENTITY.md', 'user.md': 'USER.md', 'CLAUDE.md': 'CLAUDE.md' }

  try {
    const raw = await fs.readFile(safePath('openclaw.json'), 'utf8')
    const config = JSON.parse(raw)
    const agentList2 = config.agents?.list || config.agents || []
    const agent = agentList2.find(a => a.id === id)
    if (!agent) return res.status(404).json({ error: 'Agent not found' })

    const wsDir = agent.workspace
      ? agent.workspace.replace('/home/node', os.homedir())
      : (id === 'main' ? path.join(OC_DIR, 'workspace') : path.join(OC_DIR, `workspace-${id}`))

    await fs.mkdir(wsDir, { recursive: true })
    await fs.writeFile(path.join(wsDir, FNAME_MAP[filename]), content, 'utf8')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Update agent fields in openclaw.json (name, description)
app.patch('/api/agent/:id', demoGuard, async (req, res) => {
  const { id } = req.params
  if (!validId(id)) return res.status(400).json({ error: 'Invalid agent id' })

  try {
    const configPath = safePath('openclaw.json')
    const raw = await fs.readFile(configPath, 'utf8')
    const config = JSON.parse(raw)
    const list = config.agents?.list || config.agents || []
    const idx = list.findIndex(a => a.id === id)
    if (idx === -1) return res.status(404).json({ error: 'Agent not found' })

    const allowed = ['name', 'description', 'model']
    for (const key of allowed) {
      if (req.body[key] !== undefined) list[idx][key] = req.body[key]
    }
    // Write back into the right structure
    if (config.agents?.list) config.agents.list = list
    else config.agents = list

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8')
    res.json({ ok: true, agent: config.agents[idx] })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── Cron Jobs ─────────────────────────────────────────────────────────────
app.get('/api/cron', async (req, res) => {
  try {
    const raw = await fs.readFile(safePath('cron', 'jobs.json'), 'utf8')
    const parsed = JSON.parse(raw)
    // Support both array and { version, jobs: [] } formats
    const jobs = Array.isArray(parsed) ? parsed : (parsed.jobs || parsed)
    res.json(jobs)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/cron', demoGuard, async (req, res) => {
  try {
    const jobsPath = safePath('cron', 'jobs.json')
    const raw = await fs.readFile(jobsPath, 'utf8')
    const parsed = JSON.parse(raw)
    // Preserve wrapper structure if present
    let toWrite
    if (!Array.isArray(parsed) && parsed.jobs) {
      toWrite = { ...parsed, jobs: req.body }
    } else {
      toWrite = req.body
    }
    await fs.writeFile(jobsPath, JSON.stringify(toWrite, null, 2), 'utf8')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Toggle single job enabled/disabled
app.patch('/api/cron/:jobId/toggle', demoGuard, async (req, res) => {
  const { jobId } = req.params
  try {
    const jobsPath = safePath('cron', 'jobs.json')
    const raw = await fs.readFile(jobsPath, 'utf8')
    const parsed = JSON.parse(raw)
    const jobs = Array.isArray(parsed) ? parsed : (parsed.jobs || [])
    const job = jobs.find(j => j.id === jobId)
    if (!job) return res.status(404).json({ error: 'Job not found' })
    job.enabled = !job.enabled
    const toWrite = !Array.isArray(parsed) && parsed.jobs ? { ...parsed, jobs } : jobs
    await fs.writeFile(jobsPath, JSON.stringify(toWrite, null, 2), 'utf8')
    res.json({ ok: true, enabled: job.enabled })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── Cron Runs ─────────────────────────────────────────────────────────────
app.get('/api/cron/runs', async (req, res) => {
  try {
    const runsDir = safePath('cron', 'runs')
    let files
    try {
      files = await fs.readdir(runsDir)
    } catch {
      return res.json({})
    }

    // Read last line of each jsonl file (most recent event)
    const byJob = {}
    for (const f of files) {
      if (!f.endsWith('.jsonl')) continue
      const jobId = f.replace('.jsonl', '')
      try {
        const content = await fs.readFile(path.join(runsDir, f), 'utf8')
        const lines = content.trim().split('\n').filter(Boolean)
        if (lines.length === 0) continue
        // Last line = most recent event
        const last = JSON.parse(lines[lines.length - 1])
        byJob[jobId] = last
      } catch {
        // ignore parse errors
      }
    }

    res.json(byJob)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── Pit Stop Config (server-side persistence) ─────────────────────────────
const PIT_CONFIG_PATH = path.join(OC_DIR, 'pit-stop-config.json')

async function readPitConfig() {
  try { return JSON.parse(await fs.readFile(PIT_CONFIG_PATH, 'utf8')) } catch { return {} }
}
async function writePitConfig(data) {
  await fs.writeFile(PIT_CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8')
}

app.get('/api/pit-config', async (_req, res) => {
  res.json(await readPitConfig())
})

app.put('/api/pit-config', demoGuard, async (req, res) => {
  try {
    const current = await readPitConfig()
    const updated = { ...current, ...req.body }
    await writePitConfig(updated)
    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── Chat Proxy ────────────────────────────────────────────────────────────
// Forwards to OpenClaw gateway. Configure OPENCLAW_GATEWAY if needed.
const OC_GATEWAY = process.env.OPENCLAW_GATEWAY || 'http://localhost:18789'

// ─── TTS ───────────────────────────────────────────────────────────────────
const OPENAI_TTS_VOICES = ['alloy','echo','fable','onyx','nova','shimmer']

app.post('/api/tts', async (req, res) => {
  const { text, voice = 'nova', model = 'tts-1' } = req.body
  if (!text) return res.status(400).json({ error: 'text required' })
  if (!OPENAI_TTS_VOICES.includes(voice)) return res.status(400).json({ error: 'invalid voice' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not set' })

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input: text.slice(0, 4096), voice }),
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(502).json({ error: `OpenAI TTS error ${response.status}`, detail: err })
    }

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    const buf = await response.arrayBuffer()
    res.send(Buffer.from(buf))
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

// ─── Chat (async job, avoids Cloudflare 100s timeout) ──────────────────────
const chatJobs = new Map() // jobId → { status, reply, error, ts }

function pruneJobs() {
  const cutoff = Date.now() - 10 * 60 * 1000 // keep 10 min
  for (const [id, job] of chatJobs) {
    if (job.ts < cutoff) chatJobs.delete(id)
  }
}

app.post('/api/chat', demoGuard, async (req, res) => {
  const { agentId, message } = req.body
  if (!agentId || !message) return res.status(400).json({ error: 'agentId and message required' })
  if (!validId(agentId)) return res.status(400).json({ error: 'Invalid agent id' })

  const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  chatJobs.set(jobId, { status: 'running', reply: null, error: null, ts: Date.now() })
  pruneJobs()

  // Run agent in background — don't await
  ;(async () => {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    const escaped = message.replace(/'/g, `'"'"'`)
    const containerName = process.env.OPENCLAW_CONTAINER || 'openclaw-docker-openclaw-1'
    const cmd = `docker exec -u node ${containerName} openclaw agent --agent '${agentId}' --message '${escaped}' --json`
    try {
      const { stdout } = await execAsync(cmd, { timeout: 300000 })
      const jsonStart = stdout.indexOf('\n{')
      if (jsonStart !== -1) {
        try {
          const parsed = JSON.parse(stdout.slice(jsonStart + 1))
          const reply = parsed?.result?.payloads?.[0]?.text ?? parsed?.reply ?? null
          chatJobs.set(jobId, { status: 'done', reply, runId: parsed?.runId, ts: Date.now() })
          return
        } catch { /* fall through */ }
      }
      chatJobs.set(jobId, { status: 'done', reply: stdout.trim(), ts: Date.now() })
    } catch (e) {
      chatJobs.set(jobId, { status: 'error', error: e.message?.split('\n')[0] || 'Agent exec failed', ts: Date.now() })
    }
  })()

  res.json({ jobId })
})

app.get('/api/chat/:jobId', (req, res) => {
  const job = chatJobs.get(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  res.json(job)
})

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🏎️  OpenClaw Pit Stop\n`)
  console.log(`  → http://localhost:${PORT}`)
  console.log(`  → OpenClaw dir: ${OC_DIR}`)
  console.log(`  → OpenClaw gateway: ${OC_GATEWAY}\n`)
})
