window.PIT_STOP_CONFIG = {

  // Pipeline definitions for the Pipeline tab.
  // Copy this file to config.js and customize for your agents and cron jobs.
  // config.js is gitignored — safe to put private agent names here.

  pipelines: [
    {
      id: 'my-pipeline',
      name: 'My Pipeline',
      steps: [
        // label:    display name for this step
        // agent:    agent ID (must match openclaw.json)
        // time:     scheduled time label (display only)
        // jobMatch: regex matched against cron job name or prompt message
        { label: 'Plan',   agent: 'agent-a', time: '09:00', jobMatch: 'plan|planning' },
        { label: 'Build',  agent: 'agent-b', time: '10:00', jobMatch: 'build|develop' },
        { label: 'Review', agent: 'agent-c', time: '15:00', jobMatch: 'review|check' },
        { label: 'Deploy', agent: 'agent-d', time: '16:00', jobMatch: 'deploy|release' },
      ]
    },
  ],

}
