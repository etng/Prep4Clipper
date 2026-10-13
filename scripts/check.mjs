import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { manifest, root, runtimeFiles } from './extension-files.mjs';

function scripts(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? scripts(path) : /\.(?:js|mjs)$/.test(entry.name) ? [path] : [];
  });
}
for (const file of ['extension', 'tests', 'scripts'].flatMap(dir => scripts(join(root, dir)))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error(result.error?.message ?? result.stderr);
}
console.log(`语法与资源检查通过：v${manifest.version}，${runtimeFiles.length} 个运行文件。`);

const candidates = process.env.CHROME_BIN ? [process.env.CHROME_BIN] : process.platform === 'darwin'
  ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'chromium']
  : ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'];
const chrome = candidates.find(binary => spawnSync(binary, ['--version'], { timeout: 5000 }).status === 0);
if (!chrome) throw new Error('未找到 Chrome / Chromium；请设置 CHROME_BIN，或手工打开 tests/normalize.html。');

const profile = mkdtempSync(join(tmpdir(), 'prep4clipper-check-'));
try {
  const result = spawnSync(chrome, [
    '--headless', '--disable-gpu', '--disable-background-networking', '--disable-sync',
    '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`,
    '--virtual-time-budget=3000', '--dump-dom', pathToFileURL(join(root, 'tests/normalize.html')).href
  ], { encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024 });
  if (result.error || result.status !== 0 || !result.stdout.includes('data-test-result="passed"')) {
    const output = result.stdout?.match(/<pre id="results">([\s\S]*?)<\/pre>/)?.[1];
    throw new Error(output ?? result.error?.message ?? result.stderr ?? '浏览器验证未完成。');
  }
  console.log(result.stdout.match(/全部 \d+ 项检查通过。/)[0]);
} finally {
  rmSync(profile, { recursive: true, force: true });
}
