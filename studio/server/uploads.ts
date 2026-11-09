// Files pasted, dropped or picked in the chat: images, documents, spreadsheets, audio and video. Each is saved as it
// comes in the open project's .reel-studio/images/ (gitignored; the folder keeps its first name so older messages
// still find their images), served to the page at /chat-images/<name>, and handed to the agent with the message as a
// path it reads. The message keeps their names, so the transcript shows them again. A name carries the original
// file name (slugged), so the agent and the chat both know what it was: 20261108-a1b2c3d4e5f6-informe-q3.pdf.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {PROJECT_DIR, rel} from './workspace.ts';
import {httpError} from './reels.ts';

export type UploadKind = 'image' | 'document' | 'audio' | 'video';

// What can be attached, by extension. Images go in the message as images; the rest, as files.
const KINDS: Record<string, UploadKind> = {
  png: 'image', jpg: 'image', webp: 'image', gif: 'image',
  pdf: 'document', txt: 'document', md: 'document', csv: 'document', tsv: 'document', json: 'document', html: 'document', rtf: 'document',
  docx: 'document', doc: 'document', xlsx: 'document', xls: 'document', pptx: 'document', ppt: 'document', odt: 'document', ods: 'document', srt: 'document', vtt: 'document',
  mp3: 'audio', wav: 'audio', m4a: 'audio', ogg: 'audio', aac: 'audio', flac: 'audio',
  mp4: 'video', mov: 'video', webm: 'video', m4v: 'video',
};
// What a browser may send without a file name (a pasted screenshot): its type.
export const TYPES: Record<string, string> = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf', 'text/plain': 'txt', 'text/markdown': 'md', 'text/csv': 'csv'};
export const EXTENSIONS = Object.keys(KINDS);
const ALIAS: Record<string, string> = {jpeg: 'jpg', markdown: 'md', htm: 'html', qt: 'mov'};

const NAME = /^\d{8}-[a-f0-9]{12}(?:-[a-z0-9-]{1,48})?\.([a-z0-9]{2,5})$/;
const MAX = 10; // per message
export const MAX_BYTES = 200 * 1024 * 1024;
const DIR = () => path.join(PROJECT_DIR, '.reel-studio', 'images');

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/, '');

// Saves one upload. original: its file name (from the X-File-Name header), when it has one.
export function save(data: unknown, type: string, original = '') {
  const fromName = path.extname(original).slice(1).toLowerCase();
  const ext = ALIAS[fromName] ?? (KINDS[fromName] ? fromName : TYPES[type]);
  if (!ext || !KINDS[ext]) throw httpError(415, `no puedo leer ese tipo de archivo${fromName ? ` (.${fromName})` : ''}: usa imágenes, PDF, Word, Excel, PowerPoint, texto, CSV, audio o video`);
  if (!Buffer.isBuffer(data) || !data.length) throw httpError(400, 'el archivo llegó vacío');
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const base = slug(path.basename(original, path.extname(original)));
  const name = `${day}-${crypto.randomBytes(6).toString('hex')}${base ? `-${base}` : ''}.${ext}`;
  fs.mkdirSync(DIR(), {recursive: true});
  fs.writeFileSync(path.join(DIR(), name), data);
  return {name, kind: KINDS[ext]};
}

export const kindOf = (name: string): UploadKind | null => KINDS[NAME.exec(name)?.[1] ?? ''] ?? null;

// Files of a conversation being deleted. Each message has its own files, so nothing else shows them.
export function remove(names: string[]) {
  for (const name of names) {
    const p = file(name);
    if (p) fs.rmSync(p, {force: true});
  }
}

// The file of an upload of the open project, or null.
export function file(name: string) {
  const p = kindOf(name) ? path.join(DIR(), name) : null;
  return p && fs.existsSync(p) ? p : null;
}

// The uploads a message names that exist (at most MAX).
export const valid = (v: unknown): string[] => (Array.isArray(v) ? [...new Set(v.filter((n): n is string => typeof n === 'string' && !!file(n)))].slice(0, MAX) : []);

// How the agent reads each kind (it can run commands in the workspace).
const HOW: Record<Exclude<UploadKind, 'image'>, string> = {
  document: 'PDF, texto, Markdown, CSV y JSON con Read; Word, Excel y PowerPoint sacando su texto con Python (python-docx, openpyxl, python-pptx; instálalos en el venv del workspace si faltan)',
  audio: 'audio: transcríbelo con faster-whisper (como hace tools/footage.py transcribe) antes de opinar',
  video: 'video: transcribe su audio con faster-whisper y saca algunos fotogramas con ffmpeg para verlos con Read',
};

// For the agent's prompt: where they are, from the workspace (its working folder), and how to read them.
export function agentText(images: string[], files: string[] = []) {
  const out: string[] = [];
  if (images.length)
    out.push(`[Imágenes que pegó en este mensaje (míralas con Read antes de responder): ${images.map((n) => rel(path.join(DIR(), n))).join(', ')}. Si son para algo que se guarda (referencias de un estilo, fotos de un video…), cópialas a su sitio: esta carpeta es solo del chat.]`);
  if (files.length) {
    const kinds = [...new Set(files.map((n) => kindOf(n)!))].filter((k): k is Exclude<UploadKind, 'image'> => k !== 'image');
    out.push(`[Archivos que adjuntó para que los analices (léelos enteros antes de responder): ${files.map((n) => rel(path.join(DIR(), n))).join(', ')}. Cómo: ${kinds.map((k) => HOW[k]).join('; ')}. Si son para algo que se guarda, cópialos a su sitio: esta carpeta es solo del chat.]`);
  }
  return out.join('\n');
}
