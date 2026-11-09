// The Claude account the studio uses (its own or the terminal's) and how a failing claude is explained. Temp config.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-claude-'));
process.on('exit', () => fs.rmSync(root, {recursive: true, force: true}));
process.env.REEL_STUDIO_WORKSPACE = root;
process.env.REEL_STUDIO_CONFIG_DIR = path.join(root, '.cfg');
delete process.env.CLAUDE_CONFIG_DIR;

test('a separate account sets CLAUDE_CONFIG_DIR for every claude the studio starts, and is remembered', async () => {
  const agent = await import('./agent.ts');
  const ws = await import('./workspace.ts');
  assert.equal(agent.claudeAccount().separate, false);
  assert.equal(process.env.CLAUDE_CONFIG_DIR, undefined);
  assert.equal(agent.claudeDir(), path.join(os.homedir(), '.claude'));

  const on = agent.setClaudeSeparate(true);
  assert.deepEqual(on, {separate: true, dir: agent.SEPARATE_CLAUDE_DIR});
  assert.equal(process.env.CLAUDE_CONFIG_DIR, agent.SEPARATE_CLAUDE_DIR);
  assert.equal(ws.appConfig().claudeSeparate, true);

  agent.setClaudeSeparate(false);
  assert.equal(process.env.CLAUDE_CONFIG_DIR, undefined);
  assert.equal(ws.appConfig().claudeSeparate, false);
  assert.deepEqual(agent.claudeAccount(), {separate: false, dir: agent.DEFAULT_CLAUDE_DIR});
});

test('new terms to accept and a lost login are said plainly; anything else is left as it was', async () => {
  const {explainClaudeError} = await import('./agent.ts');
  const terms = '[ACTION REQUIRED] An update to our Consumer Terms and Privacy Policy has taken effect on October 8, 2025. You must run `claude` to review the updated terms.';
  assert.match(explainClaudeError(terms)!, /términos actualizados.*Abrir Claude en Terminal/);
  assert.match(explainClaudeError('Invalid API key · Please run /login')!, /sesión iniciada/);
  assert.equal(explainClaudeError('Error: something else broke'), null);
});
