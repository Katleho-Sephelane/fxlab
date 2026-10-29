const { execSync } = require('child_process');
const { getEnvConfig } = require('../config/env');

function freeConfiguredPort() {
  const { port } = getEnvConfig();
  if (process.platform !== 'win32') return;

  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const lines = output.split(/\r?\n/).filter(Boolean);
    const pids = new Set();

    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[parts.length - 1], 10);
        if (pid && pid !== process.pid && pid > 0) {
          pids.add(pid);
        }
      }
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[Nexora API] Stopped previous process (PID ${pid}) on port ${port}.`);
      } catch (_ignore) {
        // Ignore if process already exited
      }
    }
  } catch (_noProcessOnPort) {
    // Port is already free
  }
}

freeConfiguredPort();
