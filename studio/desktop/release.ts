// Which GitHub release the installed app should update to (desktop/updater.ts). Pure, so it can be tested
// without Electron (desktop/release.test.ts). Releases come from .github/workflows/release.yml:
// vX.Y.Z (stable, from main) and vX.Y.Z-beta.N (pre-release, from develop).

export type Channel = 'stable' | 'beta';

export interface Asset {
  name: string;
  size: number;
  browser_download_url: string;
}

export interface Release {
  tag_name: string;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
  assets: Asset[];
}

export interface Update {
  version: string;
  notesUrl: string;
  zip: Asset;
}

type Parsed = {core: number[]; pre: (number | string)[]};

function parse(v: string): Parsed | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/.exec(v.trim());
  if (!m) return null;
  return {
    core: [Number(m[1]), Number(m[2]), Number(m[3])],
    pre: m[4] ? m[4].split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p)) : [],
  };
}

/** Semver order: negative if a < b, 0 if equal, positive if a > b. Invalid versions sort lowest. */
export function compareVersions(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  if (!pa || !pb) return (pa ? 1 : 0) - (pb ? 1 : 0);
  for (let i = 0; i < 3; i++) if (pa.core[i] !== pb.core[i]) return pa.core[i] - pb.core[i];
  // A version without pre-release is greater than the same one with it (1.0.0 > 1.0.0-beta.3).
  if (!pa.pre.length || !pb.pre.length) return (pa.pre.length ? 0 : 1) - (pb.pre.length ? 0 : 1);
  for (let i = 0; i < Math.max(pa.pre.length, pb.pre.length); i++) {
    const x = pa.pre[i];
    const y = pb.pre[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (x === y) continue;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    if (typeof x === 'number') return -1;
    if (typeof y === 'number') return 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

/** The newest release on the channel that is newer than `current` and has a zip for `arch`, if any. */
export function pickUpdate(releases: Release[], current: string, channel: Channel, arch: string): Update | null {
  let best: Update | null = null;
  for (const r of releases) {
    if (r.draft || (r.prerelease && channel !== 'beta')) continue;
    const version = r.tag_name.replace(/^v/, '');
    if (!parse(version) || compareVersions(version, current) <= 0) continue;
    if (best && compareVersions(version, best.version) <= 0) continue;
    const zip = r.assets.find((a) => a.name.endsWith(`-${arch}.zip`));
    if (zip) best = {version, notesUrl: r.html_url, zip};
  }
  return best;
}
