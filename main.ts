import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const caps = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 };

function validateInputs(): void {
  const data = JSON.parse(readFileSync(join(root, 'app/data/trophies.json'), 'utf8')) as { trophies?: unknown[] };
  if (!Array.isArray(data.trophies) || data.trophies.length !== 55) throw new Error('trophies.json must contain exactly 55 trophies');
  const shots = join(root, 'screenshots');
  const names = readdirSync(shots).filter((name) => !name.startsWith('.'));
  if (names.length < 3 || names.length > caps.screenshots.max) throw new Error('screenshots must contain 3 or 4 images');
  for (const name of names) {
    const path = join(shots, name);
    if (!existsSync(path) || !statSync(path).isFile()) throw new Error(`missing screenshot: ${name}`);
    const bytes = readFileSync(path);
    if (bytes.length > caps.screenshots.max_bytes) throw new Error(`screenshot exceeds byte cap: ${name}`);
    const jpg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const png = bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
    if (!jpg && !png) throw new Error(`screenshot is not a PNG or JPEG: ${name}`);
  }
}

function buildAt(directory: string): Buffer {
  mkdirSync(directory, { recursive: true });
  cpSync(join(root, 'app'), join(directory, 'app'), { recursive: true });
  cpSync(join(root, 'screenshots'), join(directory, 'screenshots'), { recursive: true });
  const dossier = Buffer.from(buildDossier(directory, caps));
  writeFileSync(join(directory, 'dossier.json'), dossier);
  return dossier;
}

validateInputs();
mkdirSync(output, { recursive: true });
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });
cpSync(join(root, 'screenshots'), join(output, 'screenshots'), { recursive: true });
const dossier = Buffer.from(buildDossier(output, caps));
writeFileSync(join(output, 'dossier.json'), dossier);

const one = mkdtempSync(join(root, '.ledger-a-'));
const two = mkdtempSync(join(root, '.ledger-b-'));
try {
  const first = buildAt(one);
  const second = buildAt(two);
  if (!first.equals(second)) throw new Error('dossier output is not deterministic');
} finally {
  rmSync(one, { recursive: true, force: true });
  rmSync(two, { recursive: true, force: true });
}
