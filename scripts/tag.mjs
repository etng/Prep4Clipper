import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { manifest, root } from './extension-files.mjs';

function run(command, args, capture = false) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.error || result.status !== 0) throw new Error(result.error?.message ?? `${command} 执行失败。`);
  return result.stdout?.trim();
}
const version = process.argv[2]?.replace(/^v/, '');
if (process.argv.length !== 3 || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version ?? '') ||
    version.split('.').some(part => Number(part) > 65535)) {
  throw new Error('用法：node scripts/tag.mjs 0.2.4（每段版本号不超过 65535）。');
}
const tag = `v${version}`;
if (run('git', ['status', '--porcelain'], true)) throw new Error('工作区有未提交的文件，请先提交或自行处理后再创建 tag。');
const branch = run('git', ['branch', '--show-current'], true);
if (branch !== 'main') throw new Error('请在 main 分支创建发布 tag。');
if (run('git', ['tag', '--list', tag], true)) throw new Error(`tag 已存在：${tag}`);
const current = manifest.version.split('.').map(Number);
const next = version.split('.').map(Number);
const difference = next.map((part, index) => part - current[index]).find(value => value !== 0);
if (difference < 0) throw new Error(`版本不能低于当前版本 ${manifest.version}。`);

const path = join(root, 'extension/manifest.json');
const original = readFileSync(path, 'utf8');
// 只替换版本字段，保留 manifest 的现有排版。
if (version !== manifest.version) {
  writeFileSync(path, original.replace(/("version"\s*:\s*")[^"]+(")/, (_, prefix, suffix) => `${prefix}${version}${suffix}`));
}
try {
  run(process.execPath, ['scripts/check.mjs']);
} catch (error) {
  writeFileSync(path, original);
  throw error;
}
if (version !== manifest.version) {
  run('git', ['add', 'extension/manifest.json']);
  run('git', ['commit', '-m', `发布 ${tag}`]);
}
run('git', ['tag', '-a', tag, '-m', `Prep4Clipper ${version}`]);
console.log(`已创建 ${tag}。发布请执行：git push --atomic origin main ${tag}`);
