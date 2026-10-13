import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync, chmodSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { extension, manifest, root, runtimeFiles } from './extension-files.mjs';

const tag = process.argv[2];
if (tag && tag !== `v${manifest.version}`) throw new Error(`tag 必须与 manifest 版本一致：v${manifest.version}`);

const stage = mkdtempSync(join(tmpdir(), 'prep4clipper-package-'));
const name = `prep4clipper-${manifest.version}.zip`;
const output = join(root, 'dist', name);
try {
  const files = [...runtimeFiles, 'LICENSE'].sort();
  for (const file of files) {
    const target = join(stage, file);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(file === 'LICENSE' ? join(root, file) : join(extension, file), target);
    chmodSync(target, 0o644);
    const timestamp = new Date('1980-01-01T00:00:00Z');
    utimesSync(target, timestamp, timestamp);
  }
  const archive = join(stage, name);
  const result = spawnSync('zip', ['-X', '-q', '-9', archive, ...files], {
    cwd: stage, env: { ...process.env, TZ: 'UTC' }, encoding: 'utf8'
  });
  if (result.error || result.status !== 0) throw new Error(result.error?.message ?? result.stderr);
  mkdirSync(dirname(output), { recursive: true });
  copyFileSync(archive, output);
  const hash = createHash('sha256').update(readFileSync(output)).digest('hex');
  writeFileSync(`${output}.sha256`, `${hash}  ${name}\n`);
  console.log(`已生成 dist/${name} 和 dist/${name}.sha256（${files.length} 个文件）。`);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
