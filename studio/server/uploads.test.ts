// Files attached in the chat: what's taken, how it's named, and what the agent is told. Temp workspace.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-up-'));
process.on('exit', () => fs.rmSync(root, {recursive: true, force: true}));
process.env.REEL_STUDIO_WORKSPACE = root;
process.env.REEL_STUDIO_CONFIG_DIR = path.join(root, '.cfg');
fs.mkdirSync(path.join(root, 'projects/canal'), {recursive: true});
fs.writeFileSync(path.join(root, 'projects/canal/project.json'), JSON.stringify({name: 'canal', created: 1}));

test('documents, audio and video are saved with their original name; unknown types are refused', async () => {
  const ws = await import('./workspace.ts');
  const up = await import('./uploads.ts');
  ws.openProject('canal');

  const pdf = up.save(Buffer.from('%PDF-1.4'), 'application/octet-stream', 'Informe Q3 (versión final).PDF');
  assert.match(pdf.name, /^\d{8}-[a-f0-9]{12}-informe-q3-version-final\.pdf$/);
  assert.equal(pdf.kind, 'document');
  assert.equal(up.kindOf(up.save(Buffer.from('x'), 'application/octet-stream', 'nota.m4a').name), 'audio');
  assert.equal(up.kindOf(up.save(Buffer.from('x'), 'application/octet-stream', 'toma.MOV').name), 'video');
  // A pasted screenshot: no name, only its type.
  const shot = up.save(Buffer.from('png'), 'image/png');
  assert.match(shot.name, /^\d{8}-[a-f0-9]{12}\.png$/);
  assert.equal(shot.kind, 'image');

  assert.throws(() => up.save(Buffer.from('x'), 'application/octet-stream', 'virus.exe'), /no puedo leer/);
  assert.throws(() => up.save(Buffer.alloc(0), 'application/octet-stream', 'vacio.pdf'), /vacío/);

  // Only names that exist, and never a path out of the folder.
  assert.deepEqual(up.valid([pdf.name, pdf.name, '../../project.json', 'nope.pdf', 3]), [pdf.name]);
  assert.equal(up.file('../project.json'), null);

  // The agent gets where they are and how to read each kind.
  const said = up.agentText([shot.name], [pdf.name]);
  assert.match(said, /Imágenes que pegó/);
  assert.match(said, /Archivos que adjuntó.*informe-q3-version-final\.pdf/);
  assert.match(said, /python-docx/);
  assert.doesNotMatch(said, /faster-whisper/);
  assert.equal(up.agentText([], []), '');

  up.remove([pdf.name]);
  assert.equal(up.file(pdf.name), null);
});
