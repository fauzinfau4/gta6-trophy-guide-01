import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
const caps = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 };
const trophyFile = join(root, 'app', 'data', 'trophies.json');
const data = JSON.parse(readFileSync(trophyFile, 'utf8')) as { trophies?: unknown[] };
if (!Array.isArray(data.trophies) || data.trophies.length !== 55) throw new Error('Expected exactly 55 trophies');
const shots = readdirSync(join(root, 'screenshots')).filter((name) => /\.(png|jpe?g)$/i.test(name));
if (shots.length < 3 || shots.length > 4) throw new Error('Expected three or four screenshots');
for (const name of shots) {
  const file = join(root, 'screenshots', name);
  if (!existsSync(file) || !statSync(file).isFile() || statSync(file).size > 262144) throw new Error(`Invalid screenshot: ${name}`);
}

mkdirSync(output, { recursive: true });
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });
mkdirSync(join(output, 'screenshots'), { recursive: true });
cpSync(join(root, 'screenshots'), join(output, 'screenshots'), { recursive: true });
writeFileSync(join(output, 'dossier.json'), buildDossier(output, caps));

const left = mkdtempSync(join(tmpdir(), 'ledger-a-'));
const right = mkdtempSync(join(tmpdir(), 'ledger-b-'));
function clearTempTree(path: string): void {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) clearTempTree(child);
  }
  chmodSync(path, 0o700);
}
try {
  cpSync(join(root, 'app'), join(left, 'app'), { recursive: true });
  cpSync(join(root, 'screenshots'), join(left, 'screenshots'), { recursive: true });
  cpSync(join(root, 'app'), join(right, 'app'), { recursive: true });
  cpSync(join(root, 'screenshots'), join(right, 'screenshots'), { recursive: true });
  const a = buildDossier(left, caps);
  const b = buildDossier(right, caps);
  if (!Buffer.from(a).equals(Buffer.from(b))) throw new Error('Dossier output is not deterministic');
} finally {
  clearTempTree(left);
  clearTempTree(right);
  rmSync(left, { recursive: true, force: true });
  rmSync(right, { recursive: true, force: true });
}
