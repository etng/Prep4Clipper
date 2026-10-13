import { lstatSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const extension = resolve(root, 'extension');
export const manifest = JSON.parse(readFileSync(resolve(extension, 'manifest.json'), 'utf8'));

if (manifest.manifest_version !== 3) throw new Error('只支持 Manifest V3。');
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(manifest.version) ||
    manifest.version.split('.').some(part => Number(part) > 65535)) {
  throw new Error('version 必须是三个不超过 65535 的整数，如 1.2.3。');
}

// 只收集声明的运行资源，避免把开发文件或本地配置打包进去。
const files = new Set();
function add(path) {
  if (typeof path !== 'string' || !/^[\w./-]+$/.test(path) ||
      path.split('/').some(part => !part || part.startsWith('.'))) {
    throw new Error(`资源路径必须为安全的相对路径：${path}`);
  }
  if (!lstatSync(resolve(extension, path)).isFile()) throw new Error(`资源不是普通文件：${path}`);
  files.add(path);
}
add('manifest.json');
add('vendor/LICENSE-Prism');
for (const path of Object.values(manifest.icons ?? {})) add(path);
for (const path of Object.values(manifest.action?.default_icon ?? {})) add(path);
for (const script of manifest.content_scripts ?? []) {
  for (const path of [...(script.js ?? []), ...(script.css ?? [])]) add(path);
}
if (manifest.action?.default_popup) {
  add(manifest.action.default_popup);
  const html = readFileSync(resolve(extension, manifest.action.default_popup), 'utf8');
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)) {
    add(match[1]);
  }
}
export const runtimeFiles = [...files].sort();
