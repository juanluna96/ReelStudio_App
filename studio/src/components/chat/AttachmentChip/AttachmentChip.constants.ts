// What the chat takes (server/uploads.ts has the same list): images go as images; the rest, as files to analyse.
export const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
export const DOCUMENT_EXT = ['pdf', 'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'html', 'htm', 'rtf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods', 'srt', 'vtt'];
export const AUDIO_EXT = ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'];
export const VIDEO_EXT = ['mp4', 'mov', 'webm', 'm4v', 'qt'];
export const ACCEPT = [...IMAGE_EXT, ...DOCUMENT_EXT, ...AUDIO_EXT, ...VIDEO_EXT].map((e) => `.${e}`).join(',');
export const MAX_FILES = 10; // per message
export const MAX_MB = 200;
