import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareVersions, pickUpdate, type Release} from './release.ts';

test('orders versions like semver, betas before their release', () => {
  const sorted = ['0.2.0', '0.1.1-beta.2', '0.1.0', '0.1.1-beta.10', '0.1.1', '0.1.0-beta.1', '1.0.0'].sort(compareVersions);
  assert.deepEqual(sorted, ['0.1.0-beta.1', '0.1.0', '0.1.1-beta.2', '0.1.1-beta.10', '0.1.1', '0.2.0', '1.0.0']);
  assert.equal(compareVersions('v1.2.3', '1.2.3'), 0);
});

const rel = (tag: string, prerelease = false, arch = 'arm64'): Release => ({
  tag_name: tag,
  prerelease,
  draft: false,
  html_url: `https://example.test/${tag}`,
  assets: [
    {name: `ReelStudio-${tag.slice(1)}-${arch}.dmg`, size: 2, browser_download_url: `https://example.test/${tag}.dmg`},
    {name: `ReelStudio-${tag.slice(1)}-${arch}.zip`, size: 1, browser_download_url: `https://example.test/${tag}.zip`},
  ],
});

test('stable channel ignores betas and picks the newest stable release', () => {
  const releases = [rel('v0.2.1-beta.7', true), rel('v0.2.0'), rel('v0.1.5')];
  assert.equal(pickUpdate(releases, '0.1.0', 'stable', 'arm64')?.version, '0.2.0');
  assert.equal(pickUpdate(releases, '0.2.0', 'stable', 'arm64'), null);
});

test('beta channel gets betas and stable releases, whichever is newer', () => {
  const releases = [rel('v0.2.1-beta.7', true), rel('v0.2.0'), rel('v0.2.1-beta.3', true)];
  assert.equal(pickUpdate(releases, '0.2.0', 'beta', 'arm64')?.version, '0.2.1-beta.7');
  assert.equal(pickUpdate([...releases, rel('v0.2.1')], '0.2.1-beta.7', 'beta', 'arm64')?.version, '0.2.1');
});

test('skips drafts and releases without a zip for this architecture', () => {
  const draft = {...rel('v0.3.0'), draft: true};
  assert.equal(pickUpdate([draft, rel('v0.4.0', false, 'x64')], '0.1.0', 'stable', 'arm64'), null);
  const u = pickUpdate([rel('v0.2.0')], '0.1.0', 'stable', 'arm64');
  assert.equal(u?.zip.browser_download_url, 'https://example.test/v0.2.0.zip');
});
