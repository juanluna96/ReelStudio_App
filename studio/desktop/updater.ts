// Automatic updates for the installed app, without electron-updater: Squirrel.Mac only installs apps signed
// with an Apple Developer ID, and this one is signed ad-hoc. So the app checks GitHub Releases itself
// (published by .github/workflows/release.yml), downloads the new zip, and when it quits a small script swaps
// the .app in place and, if asked, opens it again. Files downloaded this way get no quarantine flag, so an
// update opens without the right click → Abrir of the first install.
// Channel (Estable/Beta) and "Buscar actualizaciones…" live in the app menu; the choice is kept in
// <userData>/updates.json.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {execFile, spawn} from 'node:child_process';
import {promisify} from 'node:util';
import {app, dialog, Menu, shell, type BrowserWindow, type MenuItemConstructorOptions} from 'electron';
import {pickUpdate, type Channel, type Release, type Update} from './release.ts';

const REPO = 'juanluna96/ReelStudio_App';
const RELEASES = `https://api.github.com/repos/${REPO}/releases?per_page=30`;
const EVERY = 6 * 60 * 60 * 1000; // check every 6 hours while the app is open
const run = promisify(execFile);

type Staged = {version: string; app: string};
let staged: Staged | null = null; // downloaded and unpacked, installed when the app quits
let busy = false;
let getWin: () => BrowserWindow | null = () => null;

const settingsFile = () => path.join(app.getPath('userData'), 'updates.json');

function channel(): Channel {
  try {
    const c = JSON.parse(fs.readFileSync(settingsFile(), 'utf8')).channel;
    if (c === 'stable' || c === 'beta') return c;
  } catch {}
  return app.getVersion().includes('-') ? 'beta' : 'stable'; // a beta build stays on betas
}

function setChannel(c: Channel) {
  fs.mkdirSync(path.dirname(settingsFile()), {recursive: true});
  fs.writeFileSync(settingsFile(), JSON.stringify({channel: c}, null, 2));
  buildMenu();
  void check(false);
}

/** The running .app, or null when it can't be replaced (not packaged, opened from the DMG or translocated). */
function appBundle(): string | null {
  if (!app.isPackaged || process.platform !== 'darwin') return null;
  const bundle = path.resolve(process.execPath, '../../..');
  if (!bundle.endsWith('.app') || bundle.includes('/AppTranslocation/') || bundle.startsWith('/Volumes/')) return null;
  try {
    fs.accessSync(path.dirname(bundle), fs.constants.W_OK);
    return bundle;
  } catch {
    return null;
  }
}

const message = (opts: Electron.MessageBoxOptions) => {
  const win = getWin();
  return win ? dialog.showMessageBox(win, opts) : dialog.showMessageBox(opts);
};

async function download(u: Update): Promise<Staged> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-studio-update-'));
  const zip = path.join(dir, u.zip.name);
  const res = await fetch(u.zip.browser_download_url);
  if (!res.ok || !res.body) throw new Error(`descarga: HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body as import('node:stream/web').ReadableStream), fs.createWriteStream(zip));
  if (fs.statSync(zip).size !== u.zip.size) throw new Error('la descarga quedó incompleta');
  await run('/usr/bin/ditto', ['-x', '-k', zip, dir]);
  fs.rmSync(zip);
  const name = fs.readdirSync(dir).find((n) => n.endsWith('.app'));
  if (!name) throw new Error('el zip no trae la app');
  const unpacked = path.join(dir, name);
  await run('/usr/bin/codesign', ['--verify', '--deep', unpacked]); // integrity: the bundle wasn't altered
  return {version: u.version, app: unpacked};
}

/** Swap the .app once this process has exited, and open it again if `relaunch`. */
function install(relaunch: boolean) {
  const bundle = appBundle();
  if (!staged || !bundle) return;
  const script = `
    while kill -0 "$1" 2>/dev/null; do sleep 0.3; done
    rm -rf "$2.old"
    if mv "$2" "$2.old" && mv "$3" "$2"; then rm -rf "$2.old"; else [ -d "$2" ] || mv "$2.old" "$2"; fi
    xattr -dr com.apple.quarantine "$2" 2>/dev/null
    rm -rf "$(dirname "$3")"
    [ "$4" = 1 ] && open "$2"
  `;
  spawn('/bin/bash', ['-c', script, 'reel-studio-update', String(process.pid), bundle, staged.app, relaunch ? '1' : '0'], {
    detached: true,
    stdio: 'ignore',
  }).unref();
  staged = null;
}

async function check(manual: boolean) {
  if (busy) return;
  if (staged) {
    if (manual) await offerRestart();
    return;
  }
  const bundle = appBundle();
  if (!bundle) {
    if (manual)
      await message({
        type: 'info',
        message: 'Las actualizaciones automáticas necesitan la app instalada',
        detail: 'Arrastra Reel Studio a Aplicaciones y ábrela desde ahí.',
      });
    return;
  }
  busy = true;
  try {
    const res = await fetch(RELEASES, {headers: {Accept: 'application/vnd.github+json', 'User-Agent': 'ReelStudio-updater'}});
    if (!res.ok) throw new Error(`GitHub respondió ${res.status}`);
    const update = pickUpdate((await res.json()) as Release[], app.getVersion(), channel(), process.arch);
    if (!update) {
      if (manual) await message({type: 'info', message: 'Reel Studio está al día', detail: `Versión ${app.getVersion()} (canal ${channel() === 'beta' ? 'beta' : 'estable'}).`});
      return;
    }
    staged = await download(update);
    await offerRestart(update.notesUrl);
  } catch (e) {
    console.error('[updater]', e);
    if (manual) await message({type: 'warning', message: 'No pude buscar actualizaciones', detail: (e as Error).message});
  } finally {
    busy = false;
  }
}

async function offerRestart(notesUrl?: string) {
  if (!staged) return;
  const buttons = ['Reiniciar ahora', 'Al cerrar la app', ...(notesUrl ? ['Ver novedades'] : [])];
  const {response} = await message({
    type: 'info',
    buttons,
    defaultId: 0,
    cancelId: 1,
    message: `Reel Studio ${staged.version} está lista`,
    detail: `Tienes la ${app.getVersion()}. Se instala al reiniciar; si no, al cerrar la app.`,
  });
  if (response === 2 && notesUrl) shell.openExternal(notesUrl);
  if (response === 0) {
    install(true);
    app.quit();
  }
}

function buildMenu() {
  if (process.platform !== 'darwin') return;
  const c = channel();
  const template: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {role: 'about'},
        {label: 'Buscar actualizaciones…', click: () => void check(true)},
        {
          label: 'Canal de actualizaciones',
          submenu: [
            {label: 'Estable', type: 'radio', checked: c === 'stable', click: () => setChannel('stable')},
            {label: 'Beta', type: 'radio', checked: c === 'beta', click: () => setChannel('beta')},
          ],
        },
        {type: 'separator'},
        {role: 'services'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideOthers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'},
      ],
    },
    {role: 'fileMenu'},
    {role: 'editMenu'},
    {role: 'viewMenu'},
    {role: 'windowMenu'},
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/** Call once the app is ready. Only does something in the installed macOS app. */
export function setupUpdates(win: () => BrowserWindow | null) {
  if (!app.isPackaged || process.platform !== 'darwin') return;
  getWin = win;
  buildMenu();
  app.on('will-quit', () => install(false)); // a downloaded update goes in when the app closes
  setTimeout(() => void check(false), 15_000);
  setInterval(() => void check(false), EVERY);
}
